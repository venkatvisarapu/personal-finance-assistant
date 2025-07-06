// this is the main dashboard page for showing charts

import React, { useState } from 'react';
import SummaryCharts from '../components/charts/SummaryCharts';

// helper to get 1st day of current month
const getStartOfMonth = () =>
  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

// helper to get today's date
const getToday = () => new Date().toISOString().slice(0, 10);

function DashboardPage() {
  // date filter state
  const [dateRange, setDateRange] = useState({
    startDate: getStartOfMonth(),
    endDate: getToday(),
  });

  // when user changes date filter
  const handleDateChange = (e) => {
    setDateRange((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* --- date range filter block --- */}
      <div className="card filter-card">
        <h3>Filter Charts by Date</h3>
        <div className="date-filters">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
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

      {/* --- charts block --- */}
      <SummaryCharts dateRange={dateRange} />
    </div>
  );
}

export default DashboardPage;
