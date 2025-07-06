// this middleware protects our routes, making sure only logged-in users can access them

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // check if the request has an auth token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // get the token part (after Bearer)
      token = req.headers.authorization.split(' ')[1];

      // decode the token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get the user data (excluding password) and attach to req
      req.user = await User.findById(decoded.id).select('-password');

      // continue to the next route
      return next();
    } catch (error) {
      // token might be expired or invalid
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // no token at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
