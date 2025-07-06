// this file defines what a 'Transaction' looks like in our database

const mongoose = require("mongoose");

// defining the structure (schema) for a Transaction
const transactionSchema = mongoose.Schema(
  {
    // this links the transaction to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    // this can only be 'income' or 'expense'
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"]
    },

    // category of the transaction like 'Groceries', 'Rent', etc.
    category: {
      type: String,
      required: true,
      default: 'Uncategorized' // if not given, we just set this
    },

    // amount involved
    amount: {
      type: Number,
      required: true
    },

    // date of the transaction
    date: {
      type: Date,
      required: true
    },

    // some description like "bought milk" or "got salary"
    description: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true // this auto adds createdAt and updatedAt fields
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
