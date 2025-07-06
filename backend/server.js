// this is the main starting point for our backend server
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// --- !! THE FINAL CORS FIX !! ---
// This setup is crucial for a secure production deployment.
// It explicitly tells the backend which frontend URLs are allowed to make requests.

const allowedOrigins = [
  'https://your-vercel-frontend-url.vercel.app', // Your Vercel frontend URL
  'http://localhost:3000'                      // Your local development URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// Use the CORS options in your app
app.use(cors(corsOptions));


// letting our app understand JSON data
app.use(express.json());

// telling our app to use our defined routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// A simple welcome message for the root of the API
app.get("/", (req, res) => {
    res.send("Personal Finance Assistant API is running...");
});

// setting the port to run the server on
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));