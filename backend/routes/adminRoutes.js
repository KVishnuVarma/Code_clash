const express = require('express');
const { createContest, uploadProblem } = require('../controllers/adminController'); // 🔥 Make sure functions exist
const router = express.Router();

// Route to create a new contest
router.post('/create-contest', createContest); 

// Route to upload a new coding problem
router.post('/upload-problem', uploadProblem); 

module.exports = router;
