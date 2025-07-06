import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function FileUpload() {
  // Component State
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" }); // idle, processing, failed, review, saved
  const [transactionData, setTransactionData] = useState(null); // Will hold Gemini's data
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const expenseCategories = [
    "Groceries",
    "Dining",
    "Transport",
    "Utilities",
    "Rent",
    "Health",
    "Shopping",
    "Entertainment",
    "Electronics",
    "Other",
    "Uncategorized",
  ];

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ state: "failed", message: "Please select a file first." });
      return;
    }
    const formData = new FormData();
    formData.append("receipt", file);
    setStatus({
      state: "processing",
      message: "Uploading & analyzing with AI...",
    });
    setTransactionData(null);
    try {
      const { data } = await API.post("/uploads", formData);
      pollStatus(data.uploadId);
    } catch (error) {
      setStatus({
        state: "failed",
        message: error.response?.data?.message || "Upload failed!",
      });
    }
  };

  const pollStatus = (uploadId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await API.get(`/uploads/${uploadId}/status`);
        if (data.status === "completed" && data.transaction) {
          clearInterval(interval);
          setStatus({
            state: "review",
            message: "AI analysis complete! Please review and save.",
          });
          setTransactionData({
            ...data.transaction,
            date: new Date(data.transaction.date).toISOString().slice(0, 10),
          });
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus({
            state: "failed",
            message: `Analysis failed: ${data.errorMessage}`,
          });
        }
      } catch (error) {
        clearInterval(interval);
        setStatus({
          state: "failed",
          message: "Could not get processing status.",
        });
      }
    }, 3000);
  };

  const handleDataChange = (e) => {
    setTransactionData({ ...transactionData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!transactionData) return;
    try {
      // --- !! THE FIX !! ---
      // Instead of just sending the category to a specific URL,
      // we send ALL the (potentially edited) transaction data to the general update URL.
      const { _id, ...dataToUpdate } = transactionData;
      await API.put(`/transactions/${_id}`, dataToUpdate);

      setStatus({
        state: "saved",
        message: "Transaction saved successfully! Redirecting...",
      });
      setTimeout(() => navigate("/transactions"), 1500);
    } catch (error) {
      console.error("Save failed:", error);
      setStatus({ state: "failed", message: "Failed to save transaction." });
    }
  };

  const renderUploadForm = () => (
    <form onSubmit={handleFileSubmit}>
      <div className="form-group">
        <label>Select Receipt File</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileInputRef}
          accept="image/*,application/pdf"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={status.state === "processing"}
      >
        {status.state === "processing"
          ? "Analyzing..."
          : "Upload & Scan with AI"}
      </button>
    </form>
  );

  const renderReviewForm = () => (
    <div className="review-form">
      <div className="form-group">
        <label>Description (Merchant)</label>
        <input
          type="text"
          name="description"
          value={transactionData.description}
          onChange={handleDataChange}
        />
      </div>
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={transactionData.amount}
          onChange={handleDataChange}
        />
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={transactionData.date}
          onChange={handleDataChange}
        />
      </div>
      <div className="form-group">
        <label>Category (AI Suggested)</label>
        <select
          name="category"
          value={transactionData.category}
          onChange={handleDataChange}
        >
          {!expenseCategories.includes(transactionData.category) && (
            <option
              key={transactionData.category}
              value={transactionData.category}
            >
              {transactionData.category}
            </option>
          )}
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSave} className="btn btn-primary btn-block">
        Confirm & Save Transaction
      </button>
    </div>
  );

  return (
    <div>
      {status.state !== "review" ? renderUploadForm() : renderReviewForm()}
      {status.message && (
        <div
          className={`upload-status ${status.state}`}
          style={{ marginTop: "1rem" }}
        >
          <p style={{ margin: 0, fontWeight: "500" }}>{status.message}</p>
        </div>
      )}
    </div>
  );
}
export default FileUpload;
