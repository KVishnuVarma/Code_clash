const express = require("express");
const {
  submitCode,
  getSubmissionHistory,
  getSubmissionDetails,
  getProblemParticipants,
} = require("../controllers/submissionController");

const router = express.Router();

// Submit code for evaluation
router.post("/submit", submitCode);

// Get submission history for a user
router.get("/history", getSubmissionHistory);

// Get detailed submission information
router.get("/details/:submissionId", getSubmissionDetails);

// Get all users who have submitted to a specific problem
router.get("/participants/:problemId", getProblemParticipants);

module.exports = router;
