const express = require("express");
const router = express.Router();
const Contest = require("../models/contest");

// Create a new contest
router.post("/", async (req, res) => {
    try {
        const { title, startTime, endTime, problems, difficulty , rules , allowedLanguages , maxAttempts , description , status } = req.body;
        console.log(req.body)

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: "Title, startTime, and endTime are required" });
        }

        const contest = new Contest({ title, startTime, endTime, problems: problems || [] ,difficulty , rules , allowedLanguages , maxAttempts , description , status});
        await contest.save();
        res.status(201).json({ message: "Contest created successfully", contest });

    } catch (error) {
        console.error("Error creating contest:", error); // ✅ Log error details
        res.status(500).json({ 
            error: "Failed to create contest", 
            details: error.message, 
            stack: error.stack  // ✅ Include full error stack trace
        });
    }
});

// Update an existing contest
router.put("/:id", async (req, res) => {
    try {
        const updatedContest = await Contest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedContest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        res.json({ message: "Contest updated successfully", updatedContest });
    } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ error: "Failed to update contest", details: error.message });
    }
});

// Get all contests
router.get("/", async (req, res) => {
    try {
        const contests = await Contest.find().populate("problems");
        res.json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ error: "Failed to fetch contests", details: error.message });
    }
});

// Get a single contest by ID
router.get("/:id", async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate("problems");

        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        res.json(contest);
    } catch (error) {
        console.error("Error fetching contest:", error);
        res.status(500).json({ error: "Failed to fetch contest", details: error.message });
    }
});

// Delete a contest by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedContest = await Contest.findByIdAndDelete(req.params.id);

        if (!deletedContest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        res.json({ message: "Contest deleted successfully" });
    } catch (error) {
        console.error("Error deleting contest:", error);
        res.status(500).json({ error: "Failed to delete contest", details: error.message });
    }
});

module.exports = router;
