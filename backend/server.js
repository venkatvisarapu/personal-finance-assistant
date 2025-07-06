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

// --- !! THE FIX !! ---
// We are updating the "guest list" (allowed origins) for our server.
// It now explicitly includes the URL of your deployed Vercel frontend.
const allowedOrigins = [
    'https://personal-finance-assistant-ecru.vercel.app', // Your Vercel Frontend URL
    'https://personal-finance-assistant-irzy.onrender.com', // Your Render Backend URL
    'http://localhost:5173', // For local development (Vite)
    'http://localhost:3000'  // For local development (if using Create React App)
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
    },
    credentials: true
};
app.use(cors(corsOptions));


// letting our app understand JSON data
app.use(express.json());

// telling our app to use our defined routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
// Corrected the upload route path from your provided code
app.use("/api/upload", require("./routes/uploadRoutes")); 

// The backend's only job is to be an API. Vercel will handle serving the frontend.
// A simple welcome message for the root of the API
app.get("/", (req, res) => {
    res.send("Personal Finance Assistant API is running...");
});


// setting the port to run the server on
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));