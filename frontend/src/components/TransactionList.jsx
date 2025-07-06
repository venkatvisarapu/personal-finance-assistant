// this component just displays the list of transactions in a nice table

import React from 'react';
import API from '../api';

function TransactionList({ transactions, onDelete }) {
  // when user clicks delete
  const handleDelete = async (id) => {
    // confirm before deleting
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      // delete the transaction from backend
      await API.delete(`/transactions/${id}`);

      // tell the parent to refresh the list
      onDelete(id);
    } catch (err) {
      alert("Something went wrong. Could not delete the transaction.");
    }
  };

  // no transactions to show
  if (transactions.length === 0) {
    return <p>No transactions found for the selected period.</p>;
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn._id}>
              <td>{new Date(txn.date).toLocaleDateString()}</td>
              <td>{txn.description}</td>
              <td className={`amount-cell ${txn.type}`}>
                {/* using ₹ symbol instead of $ */}
                {txn.type === 'expense' ? '-' : '+'} ₹{txn.amount.toFixed(2)}
              </td>
              <td>
                <span className="category-badge">{txn.category}</span>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(txn._id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
