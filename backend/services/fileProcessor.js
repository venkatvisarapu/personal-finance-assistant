// backend/services/fileProcessor.js

const fs = require('fs');
const Upload = require('../models/Upload');
const Transaction = require('../models/Transaction');
const { analyzeReceiptWithGemini } = require('./geminiProcessor');

// this function processes a file that was uploaded by user
// we call this after the user uploads a receipt or PDF
async function processFile(uploadId, filePath, mimeType, userId) {
  try {
    // first mark the upload as 'processing'
    await Upload.findByIdAndUpdate(uploadId, { status: 'processing' });

    // use Gemini to extract the data (amount, date, description, etc.)
    const extractedData = await analyzeReceiptWithGemini(filePath, mimeType);

    // if we got valid result from Gemini
    if (extractedData && extractedData.amount) {
      const newTransaction = new Transaction({
        user: userId,
        type: 'expense',
        amount: extractedData.amount,
        date: extractedData.date,
        description: extractedData.description,
        category: extractedData.category,
      });

      const savedTransaction = await newTransaction.save();

      // link the upload to the created transaction
      await Upload.findByIdAndUpdate(uploadId, {
        status: 'completed',
        transaction: savedTransaction._id,
      });
    } else {
      // AI didn't return the expected info
      throw new Error('AI could not extract transaction details from the document.');
    }
  } catch (error) {
    // something went wrong during processing
    console.error(`Processing failed for upload ${uploadId}:`, error.message);

    // update the upload record to show it failed
    await Upload.findByIdAndUpdate(uploadId, {
      status: 'failed',
      errorMessage: error.message,
    });
  } finally {
    // clean up: delete the uploaded file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { processFile };
