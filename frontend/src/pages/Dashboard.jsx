import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import SummaryCharts from '../components/charts/SummaryCharts';
import FileUpload from '../components/FileUpload';

// get first day of current month
const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
};

// get today's date
const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

function Dashboard() {
  // date range filter state
  const [dateRange, setDateRange] = useState({
    startDate: getStartOfMonth(),
    endDate: getToday(),
  });

  // refresh counter (to trigger re-renders)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // call this whenever something is added (form or upload)
  const handleNewData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // update selected date range
  const handleDateChange = (e) => {
    setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* --- date filter form --- */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <h3 style={{ marginTop: 0 }}>Filter by Date</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* --- dashboard content --- */}
      <div className="dashboard-grid">
        {/* charts block */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <SummaryCharts dateRange={dateRange} refreshTrigger={refreshTrigger} />
        </div>

        {/* manual entry form */}
        <div className="card">
          <h2>Add Transaction</h2>
          <TransactionForm onTransactionAdded={handleNewData} />
        </div>

        {/* file upload for receipt parsing */}
        <div className="card">
          <h2>Upload Receipt</h2>
          <FileUpload onUploadComplete={handleNewData} />
        </div>

        {/* transaction list */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2>Transactions</h2>
          <TransactionList dateRange={dateRange} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
