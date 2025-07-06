import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import FileUpload from '../components/FileUpload';

// this page lets users add a transaction manually or using a receipt (AI)
function AddTransactionPage() {
  const [manualFormSuccess, setManualFormSuccess] = useState(false);
  const navigate = useNavigate();

  // called when manual form is submitted
  const handleManualTransactionAdded = () => {
    setManualFormSuccess(true);

    // redirect after 1.5 seconds
    setTimeout(() => {
      navigate('/transactions');
    }, 1500);
  };

  return (
    <div>
      <h1>Add a Transaction</h1>

      {/* two side-by-side blocks (manual + file scan) */}
      <div className="add-transaction-grid">
        {/* Manual Entry */}
        <div className="card">
          <h2>Enter Manually</h2>
          {manualFormSuccess && (
            <p className="success-message">
              Transaction added successfully! Redirecting...
            </p>
          )}
          <TransactionForm onTransactionAdded={handleManualTransactionAdded} />
        </div>

        {/* AI Scan Upload */}
        <div className="card">
          <h2>Scan from Receipt (AI-Powered)</h2>
          <FileUpload />
        </div>
      </div>
    </div>
  );
}

export default AddTransactionPage;
