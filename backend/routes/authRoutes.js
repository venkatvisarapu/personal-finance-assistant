// this file defines the API routes for authentication (login and register)

const express = require("express");
const { registerUser, authUser } = require("../controllers/authController");

const router = express.Router();

// when someone sends a POST request to /api/auth/register, we run registerUser
router.post("/register", registerUser);

// for login requests
router.post("/login", authUser);

module.exports = router;
