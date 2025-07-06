// this is the main starting point for our backend server

const express = require("express");
const dotenv =require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// setting up environment variables from the .env file
dotenv.config();
// connecting to our MongoDB database
connectDB();

const app = express();

// allowing our frontend to talk to our backend
// In production, we should be more specific for security.
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-vercel-frontend-url.vercel.app' // Replace this with your actual Vercel URL
        : 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));


// letting our app understand JSON data
app.use(express.json());

// telling our app to use our defined routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// --- !! THE FIX !! ---
// We remove the block of code that tries to serve the frontend files.
// The backend's only job is to be an API. Vercel will handle serving the frontend.

// A simple welcome message for the root of the API
app.get("/", (req, res) => {
    res.send("Personal Finance Assistant API is running...");
});


// setting the port to run the server on
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));