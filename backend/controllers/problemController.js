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
        // Virtuals (like successRate) are included due to toJSON virtuals: true
        res.status(200).json(problems.map(p => p.toJSON()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getParticularProblems = async (req, res) => {
    const id = req.params.id;
    try {
        const problem = await Problem.findById(id); // Use findById for a single object
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }
        // Virtuals (like successRate) are included due to toJSON virtuals: true
        res.status(200).json(problem.toJSON()); // Return the object, not an array
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an existing problem
exports.updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProblem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
