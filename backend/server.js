// this is the main starting point for our backend server
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs"); // We need the 'fs' module to interact with the file system
const path = require("path"); // We need the 'path' module to handle file paths correctly
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// --- !! GUARANTEED CORS & FILE SYSTEM FIX !! ---

// 1. Ensure the 'uploads' directory exists before starting the server.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Created 'uploads' directory.");
}

// 2. Set up a robust CORS policy.
const allowedOrigins = [
  'https://personal-finance-assistant-ecru.vercel.app', // Your Vercel frontend URL
  'http://localhost:3000'                                 // Your local development URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from our list and also allow requests with no origin (e.g., Postman, mobile apps)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Use the CORS options in your app
app.use(cors(corsOptions));

// Explicitly handle preflight (OPTIONS) requests. This is crucial for file uploads.
app.options('*', cors(corsOptions));


// letting our app understand JSON data from requests
app.use(express.json());

// telling our app to use our defined API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// A simple welcome message for the root of the API
app.get("/", (req, res) => {
    res.send("Personal Finance Assistant API is running...");
});

// setting the port to run the server on
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));