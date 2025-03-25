const express = require("express");
const {
  submitCode,
  getSubmissionHistory,
  getSubmissionDetails,
} = require("../controllers/submissionController");

const router = express.Router();

// Submit code for evaluation
router.post("/submit", submitCode);

// Get submission history for a user
router.get("/history", getSubmissionHistory);

// Get detailed submission information
router.get("/details/:submissionId", getSubmissionDetails);

module.exports = router;
