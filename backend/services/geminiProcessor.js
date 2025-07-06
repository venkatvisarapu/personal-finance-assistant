// backend/services/geminiProcessor.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Initialize the Gemini client with your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This helper function reads a file from your server and converts it into
// the base64 format that the Gemini API needs to see images or PDFs.
function fileToGenerativePart(path, mimeType) {
  if (!fs.existsSync(path)) {
    throw new Error("File not found for Gemini processing.");
  }
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeReceiptWithGemini(filePath, mimeType) {
  // --- !! THE CRITICAL FIX !! ---
  // Using the model Google now recommends for this task: 'gemini-1.5-flash-latest'
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // This is the instruction we give to the AI.
  const prompt = `
    Analyze the following receipt image. Extract the information and respond ONLY with a valid JSON object.
    Do not include any text, markdown, or the word "json" outside of the JSON structure.

    The JSON object must have these exact keys:
    - "merchant_name": The name of the store. If not found, use null.
    - "transaction_date": The date in "YYYY-MM-DD" format. If not found, use null.
    - "total_amount": The final total amount as a number. If not found, use null.
    - "suggested_category": A likely category like "Groceries", "Dining", "Gas", "Shopping", or "Other".

    Example response:
    {
      "merchant_name": "SUNRISE ENTERPRISE",
      "transaction_date": "2025-01-10",
      "total_amount": 38026.00,
      "suggested_category": "Electronics"
    }
  `;

  const imagePart = fileToGenerativePart(filePath, mimeType);

  try {
    // We send the text prompt and the image part together in an array.
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to ensure it's just the JSON object.
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Parse the cleaned text into a JavaScript object.
    const data = JSON.parse(text);

    const totalAmount = data.total_amount ? parseFloat(data.total_amount) : null;

    let transactionDate = new Date(); // Default to today
    if (data.transaction_date) {
      // Create a date object, ensuring it's handled correctly across timezones.
      const parsedDate = new Date(data.transaction_date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = new Date(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
      }
    }

    if (totalAmount === null || isNaN(totalAmount)) {
      throw new Error("AI could not determine a valid total amount from the receipt.");
    }

    // Return a clean object for our backend to use.
    return {
      amount: totalAmount,
      date: transactionDate,
      description: data.merchant_name || 'Scanned Receipt',
      category: data.suggested_category || 'Uncategorized',
    };
  } catch (error) {
    console.error("Gemini API Error or JSON Parsing Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("AI returned a response in an invalid format.");
    }
    // This will catch the 404 error if the model name is wrong again.
    throw new Error("Failed to analyze receipt with AI. The service may be busy or the model is unavailable.");
  }
}

module.exports = { analyzeReceiptWithGemini };