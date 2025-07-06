// this file contains the logic for handling user registration and login

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// this function makes a token using the user id and a secret
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" }); // token will expire in 30 days
};

// this is for registering a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // check if user already exists with that email
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User with this email already exists" });
  }

  // if not, create the new user
  const user = await User.create({ name, email, password });

  // if user creation worked, send back user info + token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } else {
    // something went wrong while saving user
    res.status(400).json({ message: "Invalid user data provided" });
  }
};

// this is for logging in (authentication)
const authUser = async (req, res) => {
  const { email, password } = req.body;

  // find user by email
  const user = await User.findOne({ email });

  // if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } else {
    // login failed
    res.status(401).json({ message: "Invalid email or password" });
  }
};

module.exports = { registerUser, authUser };
