const express = require("express");
const mongoose = require("mongoose");  // ✅ Fix: Import mongoose
const router = express.Router();
const Problem = require("../models/Problem"); // ✅ Fix: Import Problem model
const { createProblem, getAllProblems, getParticularProblems, updateProblem } = require("../controllers/problemController"); // ✅ Ensure correct import

// 🛠 POST route to create a new problem
router.post("/add", createProblem);

// 🛠 GET route to fetch all problems
router.get("/", getAllProblems);

router.get("/:id", getParticularProblems);

router.put("/update/:id", updateProblem);


// 🛠 DELETE route to remove a problem by ID
router.delete("/:id", async (req, res) => {
    try {
        // 🔹 Validate MongoDB ID format before proceeding
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid problem ID format" });
        }

        // 🔹 Find and delete the problem
        const problem = await Problem.findByIdAndDelete(req.params.id);

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.json({ message: "Problem deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
