const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController'); // Ensure correct import

// Route to get all problems
router.get('/', problemController.getAllProblems);

// Route to get a specific problem by ID
router.get('/:id', problemController.getProblemById);

// Route to add a new problem (Admin only)
router.post('/', problemController.createProblem);

// Route to update a problem by ID (Admin only)
router.put('/:id', problemController.updateProblem);

// Route to delete a problem by ID (Admin only)
router.delete('/:id', problemController.deleteProblem);

module.exports = router;
