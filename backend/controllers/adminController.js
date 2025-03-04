const Contest = require('../models/Contest'); // Ensure Contest model exists
const Problem = require('../models/Problem'); // Ensure Problem model exists

// Controller to create a contest
const createContest = async (req, res) => {
    try {
        const { title, description, startDate, endDate } = req.body;
        const newContest = new Contest({ title, description, startDate, endDate });
        await newContest.save();
        res.status(201).json({ message: '✅ Contest created successfully', contest: newContest });
    } catch (error) {
        res.status(500).json({ error: '❌ Error creating contest', details: error.message });
    }
};

// Controller to upload a problem
const uploadProblem = async (req, res) => {
    try {
        const { title, description, testCases, difficulty } = req.body;
        const newProblem = new Problem({ title, description, testCases, difficulty });
        await newProblem.save();
        res.status(201).json({ message: '✅ Problem uploaded successfully', problem: newProblem });
    } catch (error) {
        res.status(500).json({ error: '❌ Error uploading problem', details: error.message });
    }
};

module.exports = { createContest, uploadProblem };
