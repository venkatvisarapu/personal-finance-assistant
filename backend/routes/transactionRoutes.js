// this file defines the API routes related to transactions
const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  getTransactionsStats,
  updateTransaction, // We will use a general update function
  deleteTransaction, 
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

// all these routes are protected, meaning you must be logged in

// for creating a new transaction or getting a list of all of them
router.route('/')
  .post(protect, addTransaction)
  .get(protect, getTransactions);

// for getting the chart data on the dashboard
router.route('/stats')
  .get(protect, getTransactionsStats);

// --- !! THE FIX !! ---
// For a specific transaction (identified by its ID), you can either update it or delete it.
// This is a cleaner, more standard way to structure the routes.
router.route('/:id')
  .put(protect, updateTransaction) // handles all updates (category, amount, etc.)
  .delete(protect, deleteTransaction); 

module.exports = router;