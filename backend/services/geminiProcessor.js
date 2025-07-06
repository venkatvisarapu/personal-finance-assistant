// backend/services/geminiProcessor.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// init gemini using the key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// this function converts a file (image or PDF) into the format Gemini expects
function fileToGenerativePart(path, mimeType) {
  if (!fs.existsSync(path)) throw new Error("File not found for Gemini processing.");

  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

// main function that sends image/pdf to Gemini and gets back structured data
async function analyzeReceiptWithGemini(filePath, mimeType) {
  // we ask for the latest Gemini model (1.5 flash)
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" });

  // this is what we ask Gemini to return
  const prompt = `
    Analyze the following receipt/invoice image and extract the following information in a pure JSON format. Do not include any text before or after the JSON object, just the JSON itself.

    The JSON object must have these exact keys:
    - "merchant_name": The name of the store or vendor. If not found, return null.
    - "transaction_date": The date of the transaction in "YYYY-MM-DD" format. If not found, return null.
    - "total_amount": The final grand total amount as a number, without currency symbols. If not found, return null.
    - "suggested_category": A suggested category based on the items (e.g., "Groceries", "Dining", "Electronics", "Utilities"). If unsure, return "Other".

    Example:
    {
      "merchant_name": "SUNRISE ENTERPRISE",
      "transaction_date": "2025-01-10",
      "total_amount": 38026.00,
      "suggested_category": "Electronics"
    }
  `;

  const imagePart = fileToGenerativePart(filePath, mimeType);

  try {
    // send prompt and image to Gemini
    const result = await model.generateContent([
      { text: prompt },
      imagePart,
    ]);

    const response = await result.response;
    let text = response.text();

    // clean any extra formatting like ```json
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // try converting the response text into a JS object
    const data = JSON.parse(text);

    // try to convert amount to a number
    const totalAmount = data.total_amount ? parseFloat(data.total_amount) : null;

    // set default date to now, or parse what Gemini gave
    let transactionDate = new Date();
    if (data.transaction_date) {
      const parsedDate = new Date(data.transaction_date);
      if (!isNaN(parsedDate.getTime())) {
        // convert to UTC-safe version
        transactionDate = new Date(parsedDate.getTime() + (parsedDate.getTimezoneOffset() * 60000));
      }
    }

    // make sure totalAmount is valid
    if (totalAmount === null || isNaN(totalAmount)) {
      throw new Error("Gemini did not return a valid total amount.");
    }

    // return the final cleaned result
    return {
      amount: totalAmount,
      date: transactionDate,
      description: data.merchant_name || 'Scanned Receipt',
      category: data.suggested_category || 'Uncategorized',
    };
  } catch (error) {
    console.error("Gemini API Error or JSON Parsing Error:", error);

    if (error instanceof SyntaxError) {
      throw new Error("AI returned an invalid format. Please try another image.");
    }

    throw new Error("Failed to analyze receipt with AI. The service may be busy.");
  }
}

module.exports = { analyzeReceiptWithGemini };
