const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController'); // Ensure correct path

// Route to get all submissions
router.get('/', submissionController.getAllSubmissions);

// Route to get submissions by user ID
router.get('/user/:userId', submissionController.getSubmissionsByUserId);

// Route to get submission by ID
router.get('/:id', submissionController.getSubmissionById);

// Route to submit a solution
router.post('/', submissionController.createSubmission);

module.exports = router;
