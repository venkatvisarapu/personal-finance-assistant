// this file contains the logic for handling file uploads and checking their status

const Upload = require("../models/Upload");
const { processFile } = require("../services/fileProcessor");

// this function runs when a user uploads a file (image or pdf)
const handleFileUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  try {
    // we save basic info of the file to the DB
    const newUpload = new Upload({
      user: req.user._id,
      filename: req.file.filename,
    });

    const savedUpload = await newUpload.save();

    // we immediately respond to the user so they don't have to wait for AI
    res.status(202).json({
      message: "File uploaded. AI analysis has started.",
      uploadId: savedUpload._id,
    });

    // now in background, we call the AI service to analyze file
    processFile(savedUpload._id, req.file.path, req.file.mimetype, req.user._id);
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
};

// this function is used by frontend to keep checking if the file is done processing
const getUploadStatus = async (req, res) => {
  try {
    // get the upload record and also include transaction if it's already created
    const upload = await Upload.findById(req.params.id).populate("transaction");

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    // make sure the upload belongs to this user
    if (upload.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // return the upload's current status and any linked transaction
    res.json({
      status: upload.status,
      transaction: upload.transaction || null,
      errorMessage: upload.errorMessage || null,
    });
  } catch (error) {
    console.error("Error checking upload status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { handleFileUpload, getUploadStatus };
