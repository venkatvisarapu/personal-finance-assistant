// this is the main starting point for our backend server
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// --- !! THE FINAL, SIMPLIFIED CORS FIX !! ---
// This setup explicitly allows your Vercel frontend to communicate with the backend.

// We will allow requests only from our live frontend URL.
const allowedOrigins = ['https://personal-finance-assistant-ecru.vercel.app'];

const corsOptions = {
  origin: (origin, callback) => {
    // In development, the 'origin' might be undefined for server-to-server requests or tools.
    // We allow our specific frontend URL.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This allows cookies and authorization headers to be sent.
};

// Use the CORS options in your app
app.use(cors(corsOptions));

// Some browsers send an OPTIONS request (a "preflight" request) before POST, PUT, DELETE etc.
// to check if the server will accept the actual request. We need to handle this.
app.options('*', cors(corsOptions)); // This tells the server to respond "OK" to any preflight request from our allowed origin.


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
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));