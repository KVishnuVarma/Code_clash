const Problem = require('../models/Problem'); // Ensure the Problem model exists

// Get all problems
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to fetch problems' });
    }
};

// Get problem by ID
exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to fetch problem' });
    }
};

// Create a new problem
exports.createProblem = async (req, res) => {
    try {
        const problem = new Problem(req.body);
        await problem.save();
        res.status(201).json({ message: '✅ Problem created successfully', problem });
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to create problem' });
    }
};

// Update a problem
exports.updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.status(200).json({ message: '✅ Problem updated successfully', problem });
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to update problem' });
    }
};

// Delete a problem
exports.deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.status(200).json({ message: '✅ Problem deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to delete problem' });
    }
};
