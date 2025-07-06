// this page shows a list of all transactions with working filters and pagination

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import TransactionList from '../components/TransactionList';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';

// a helper hook to easily get parameters from the URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// helper function to get the first day of the current month
const getStartOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
// helper function to get today's date
const getToday = () => new Date().toISOString().slice(0, 10);

function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // --- !! SIMPLIFIED AND CORRECTED STATE INITIALIZATION !! ---
  // We read from the URL. If a value is missing, it will be null.
  const currentPage = parseInt(query.get('page')) || 1;
  const startDate = query.get('startDate');
  const endDate = query.get('endDate');
  
  // This is our main data fetching function
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // If there are no dates in the URL, we use our defaults.
      // This ensures the first API call is always for the current month.
      const params = {
        page: currentPage,
        limit: 10,
        startDate: startDate || getStartOfMonth(),
        endDate: endDate || getToday(),
      };
      
      const { data } = await API.get('/transactions', { params });
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    setLoading(false);
  }, [currentPage, startDate, endDate]); // Re-run this logic only when these URL params change

  // This effect runs only when the URL changes. It's the "controller" for this page.
  useEffect(() => {
    fetchTransactions();
  }, [location.search]); // The dependency is just the URL search string itself.

  // This function builds the new URL and navigates, which triggers the useEffect above
  const handleFilterChange = (newPage, newStartDate, newEndDate) => {
    const params = new URLSearchParams();
    params.set('page', newPage);
    if (newStartDate) params.set('startDate', newStartDate);
    if (newEndDate) params.set('endDate', newEndDate);
    navigate(`/transactions?${params.toString()}`);
  };

  const handleDelete = () => {
    // After a delete, just refetch the data for the current view
    fetchTransactions();
  };

  return (
    <div>
      <h1>All Transactions</h1>
      
      <div className="card filter-card">
        <h3>Filter by Date</h3>
        <div className="date-filters">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input 
              type="date" 
              id="startDate" 
              // The value is now directly tied to the URL param, or the default
              value={startDate || getStartOfMonth()} 
              onChange={(e) => handleFilterChange(1, e.target.value, endDate || getToday())}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input 
              type="date" 
              id="endDate" 
              value={endDate || getToday()}
              onChange={(e) => handleFilterChange(1, startDate || getStartOfMonth(), e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : (
          <>
            <TransactionList transactions={transactions} onDelete={handleDelete} />
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => handleFilterChange(page, startDate, endDate)} 
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;