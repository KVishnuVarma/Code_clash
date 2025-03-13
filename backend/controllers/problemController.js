const Problem = require("../models/Problem");

// Create a new problem
exports.createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, testCases, languages } = req.body;
        const newProblem = new Problem({
            title,
            description,
            difficulty,
            testCases,
            languages,
            totalParticipants: 0
        });

        await newProblem.save();
        
        res.status(201).json({
            message: "Problem created successfully",
            problem: newProblem
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🛠 FIX: Fetch all problems
exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
