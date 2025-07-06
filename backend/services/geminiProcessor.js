// backend/services/geminiProcessor.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const https = require("https");

// initialize Gemini client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// helper function to convert file to base64 format for Gemini
function fileToGenerativePart(path, mimeType) {
  console.log("Checking if file exists at:", path);
  if (!fs.existsSync(path)) {
    throw new Error("File not found for Gemini processing.");
  }

  const base64Data = fs.readFileSync(path).toString("base64");
  console.log("File read and converted to base64.");

  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

// main function to send image/pdf to Gemini and parse the structured data
async function analyzeReceiptWithGemini(filePath, mimeType) {
  // ✅ use stable model name (avoid -latest in production)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // prompt that instructs Gemini to return only structured JSON
  const prompt = `
    Analyze the following receipt image. Extract the information and respond ONLY with a valid JSON object.
    Do not include any text, markdown, or the word "json" outside of the JSON structure.

    The JSON object must have these exact keys:
    - "merchant_name": The name of the store. If not found, use null.
    - "transaction_date": The date in "YYYY-MM-DD" format. If not found, use null.
    - "total_amount": The final total amount as a number. If not found, use null.
    - "suggested_category": A likely category like "Groceries", "Dining", "Gas", "Shopping", or "Other".

    Example:
    {
      "merchant_name": "SUNRISE ENTERPRISE",
      "transaction_date": "2025-01-10",
      "total_amount": 38026.00,
      "suggested_category": "Electronics"
    }
  `;

  // try converting image
  let imagePart;
  try {
    imagePart = fileToGenerativePart(filePath, mimeType);
  } catch (err) {
    console.error("File processing error:", err.message);
    throw new Error("Uploaded file could not be read. Try re-uploading.");
  }

  try {
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent([prompt, imagePart]);

    const response = await result.response;
    let text = response.text();

    console.log("Raw AI response:", text);

    // clean up extra formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(text);

    const totalAmount = data.total_amount ? parseFloat(data.total_amount) : null;

    let transactionDate = new Date(); // fallback
    if (data.transaction_date) {
      const parsedDate = new Date(data.transaction_date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = new Date(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
      }
    }

    if (totalAmount === null || isNaN(totalAmount)) {
      throw new Error("AI could not determine a valid total amount from the receipt.");
    }

    return {
      amount: totalAmount,
      date: transactionDate,
      description: data.merchant_name || "Scanned Receipt",
      category: data.suggested_category || "Uncategorized",
    };
  } catch (error) {
    console.error("Gemini API or JSON parsing error:", error);

    // if invalid response format
    if (error instanceof SyntaxError) {
      throw new Error("AI returned a response in an invalid format.");
    }

    // Optional: test if Render blocks outbound access
    https.get("https://generativelanguage.googleapis.com/", (res) => {
      console.log("Gemini API reachable? Status code:", res.statusCode);
    }).on("error", (e) => {
      console.error("Network issue from Render:", e.message);
    });

    throw new Error("Failed to analyze receipt with AI. The service may be busy or the model is unavailable.");
  }
}

module.exports = { analyzeReceiptWithGemini };
