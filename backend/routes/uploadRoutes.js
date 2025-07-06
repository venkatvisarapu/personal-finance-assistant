// this file defines the API routes for handling file uploads

const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleFileUpload, getUploadStatus } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// setting up multer (used to handle file uploads)
const storage = multer.diskStorage({
  // where to store the files
  destination(req, file, cb) {
    cb(null, "uploads/"); // saves into uploads/ folder
  },

  // how to name the file (we include user ID + timestamp to make each file unique)
  filename(req, file, cb) {
    cb(null, `receipt-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// function that checks if the uploaded file is allowed
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // check file extension
  const mimetype = filetypes.test(file.mimetype); // check mime type

  if (extname && mimetype) {
    return cb(null, true); // file is good
  } else {
    cb("Error: You can only upload images (jpg, png) or PDF files!");
  }
}

// combining everything into one upload handler
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// route to upload a receipt
router.post("/", protect, upload.single("receipt"), handleFileUpload);

// route to check the status of a previously uploaded file
router.get("/:id/status", protect, getUploadStatus);

module.exports = router;
