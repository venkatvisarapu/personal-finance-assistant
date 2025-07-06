import React, { useState } from "react";
import API from "../api";

// form used to add a new income or expense
function TransactionForm({ onTransactionAdded }) {
  // form fields
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  // feedback messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // separate lists depending on income or expense
  const expenseCategories = [
    "Groceries", "Rent", "Utilities", "Transport", "Entertainment",
    "Health", "Shopping", "Other"
  ];
  const incomeCategories = [
    "Salary", "Bonus", "Freelance", "Investment", "Other"
  ];

  // handles form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const transactionData = {
      type,
      category,
      amount: parseFloat(amount),
      date,
      description,
    };

    try {
      await API.post("/transactions", transactionData);
      setSuccess("Transaction added successfully!");

      // reset form
      setType("expense");
      setCategory("Groceries");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");

      // refresh the transaction list (optional)
      if (onTransactionAdded) {
        onTransactionAdded();
      }

      // remove success message after 3s
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add transaction.");
    }
  };

  // switch category options based on type (income/expense)
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    setCategory(newType === "expense" ? "Groceries" : "Salary");
  };

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  return (
    <form onSubmit={handleSubmit}>
      {/* error or success messages */}
      {error && <p style={{ color: "var(--danger-color)" }}>{error}</p>}
      {success && <p style={{ color: "var(--success-color)" }}>{success}</p>}

      {/* transaction type selector */}
      <div className="form-group">
        <label>Type</label>
        <select value={type} onChange={handleTypeChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* category dropdown */}
      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* amount input */}
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      {/* date input */}
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* description input */}
      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly grocery shopping"
          required
        />
      </div>

      {/* submit button */}
      <button type="submit" className="btn">
        Add Transaction
      </button>
    </form>
  );
}

export default TransactionForm;
