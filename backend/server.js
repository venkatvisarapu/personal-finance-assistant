// this is the main starting point for our backend server

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// load environment variables from .env file
dotenv.config();

// connect to MongoDB
connectDB();

// make the express app
const app = express();

// allow frontend to make requests (needed for localhost dev)
app.use(cors());

// let our server understand JSON in requests
app.use(express.json());

// attach our API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// this is for production — it serves the frontend build files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
  );
}

// start the server on port (default 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
