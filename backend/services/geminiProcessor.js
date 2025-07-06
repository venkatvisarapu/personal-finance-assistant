// backend/services/geminiProcessor.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
  if (!fs.existsSync(path))
    throw new Error("File not found for Gemini processing.");
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeReceiptWithGemini(filePath, mimeType) {
  // --- !! THE CRITICAL FIX !! ---
  // We change the model name to the correct one for image analysis: 'gemini-pro-vision'
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = `
    Analyze the following receipt/invoice image and extract the following information in a pure JSON format. Do not include any text before or after the JSON object, just the JSON itself.

    The JSON object must have these exact keys:
    - "merchant_name": The name of the store or vendor. If not found, return null.
    - "transaction_date": The date of the transaction in "YYYY-MM-DD" format. If not found, return null.
    - "total_amount": The final grand total amount as a number, without currency symbols. If not found, return null.
    - "suggested_category": A suggested category based on the items (e.g., "Groceries", "Dining", "Electronics", "Utilities"). If unsure, return "Other".

    Example of a perfect response:
    {
      "merchant_name": "SUNRISE ENTERPRISE",
      "transaction_date": "2025-01-10",
      "total_amount": 38026.00,
      "suggested_category": "Electronics"
    }
  `;

  const imagePart = fileToGenerativePart(filePath, mimeType);

  try {
    const result = await model.generateContent([
      prompt, // The prompt is now a single string, which is the standard way
      imagePart,
    ]);

    const response = await result.response;
    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const data = JSON.parse(text);

    const totalAmount = data.total_amount
      ? parseFloat(data.total_amount)
      : null;

    let transactionDate = new Date();
    if (data.transaction_date) {
      const parsedDate = new Date(data.transaction_date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = new Date(
          parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000
        );
      }
    }

    if (totalAmount === null || isNaN(totalAmount)) {
      throw new Error("Gemini did not return a valid total amount.");
    }

    return {
      amount: totalAmount,
      date: transactionDate,
      description: data.merchant_name || "Scanned Receipt",
      category: data.suggested_category || "Uncategorized",
    };
  } catch (error) {
    console.error("Gemini API Error or JSON Parsing Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error(
        "AI returned an invalid format. Please try another image."
      );
    }
    throw new Error(
      "Failed to analyze receipt with AI. The service may be busy or the model name is incorrect."
    );
  }
}

module.exports = { analyzeReceiptWithGemini };
