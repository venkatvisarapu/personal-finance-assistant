// this file contains all the logic for managing transactions
const Transaction = require('../models/Transaction');

// adds a new transaction to DB
const addTransaction = async (req, res) => {
  try {
    const { type, category, amount, date, description } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      type,
      category,
      amount,
      date,
      description
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// this gets a paginated list of transactions (also filters by date if provided)
const getTransactions = async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate } = req.query;

  const query = { user: req.user._id };

  // if both dates are there, filter using date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0); // start of the day

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999); // end of the day

    query.date = { $gte: start, $lte: end };
  }

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // get total count + actual paginated results at the same time
    const [count, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec()
    ]);

    const totalPages = Math.ceil(count / limitNum);

    res.json({ transactions, totalPages, currentPage: pageNum });
  } catch (error) {
    console.error("Error in getTransactions:", error);
    res.status(500).json({ message: "Server error while fetching transactions." });
  }
};

// this one gives summary data for the dashboard graphs
const getTransactionsStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // total expense grouped by category
    const expensesByCategory = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { name: '$_id', total: 1, _id: 0 } }
    ]);

    // total income vs expense
    const incomeVsExpense = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
      { $project: { name: '$_id', total: 1, _id: 0 } }
    ]);

    // daily expense trend (for line graph)
    const dailyExpenses = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', total: 1, _id: 0 } }
    ]);

    res.json({ expensesByCategory, incomeVsExpense, dailyExpenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// updates a single transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    transaction.description = req.body.description || transaction.description;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.date = req.body.date || transaction.date;
    transaction.category = req.body.category || transaction.category;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// deletes a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionsStats,
  updateTransaction,
  deleteTransaction
};
