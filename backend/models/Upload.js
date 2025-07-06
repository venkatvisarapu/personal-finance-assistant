// this file defines what an 'Upload' record looks like in our database

const mongoose = require("mongoose");

const uploadSchema = mongoose.Schema(
  {
    // the user who uploaded the file
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },

    // the name of the uploaded file (like receipt1.png)
    filename: {
      type: String,
      required: true
    },

    // this tells us what stage the file is in
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "completed", "failed"], // only these 4 allowed
      default: "pending"
    },

    // once the AI is done, this will link to the created transaction (if any)
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction"
    },

    // if anything goes wrong, we store the error message here
    errorMessage: {
      type: String
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

const Upload = mongoose.model("Upload", uploadSchema);
module.exports = Upload;
