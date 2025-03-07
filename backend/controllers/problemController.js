const Problem = require("../models/Problem");

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (err) {
        console.error("Error fetching problems:", err);
        res.status(500).json({ error: "❌ Failed to fetch problems" });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.status(200).json(problem);
    } catch (err) {
        console.error("Error fetching problem:", err);
        res.status(500).json({ error: "❌ Failed to fetch problem" });
    }
};

exports.createProblem = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const { title, description, difficulty, testCases } = req.body;

        
        if (!title || !description || !difficulty || !testCases) {
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const newProblem = new Problem({
            title,
            description,
            difficulty,
            testCases,
        });

        await newProblem.save();
        res.status(201).json({ message: "✅ Problem created successfully", problem: newProblem });
    } catch (err) {
        console.error("Error creating problem:", err);
        res.status(500).json({ error: "❌ Failed to create problem", details: err.message });
    }
};

exports.updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.status(200).json({ message: "✅ Problem updated successfully", problem });
    } catch (err) {
        console.error("Error updating problem:", err);
        res.status(500).json({ error: "❌ Failed to update problem", details: err.message });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        res.status(200).json({ message: "✅ Problem deleted successfully" });
    } catch (err) {
        console.error("Error deleting problem:", err);
        res.status(500).json({ error: "❌ Failed to delete problem", details: err.message });
    }
};
