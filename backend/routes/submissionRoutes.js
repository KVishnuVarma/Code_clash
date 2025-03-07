const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.get('/', submissionController.getAllSubmissions);

router.get('/user/:userId', submissionController.getSubmissionsByUserId);

router.get('/:id', submissionController.getSubmissionById);

router.post('/', submissionController.createSubmission);

module.exports = router;
