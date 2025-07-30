const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");

// Create a new contest
router.post("/", async (req, res) => {
    try {
        const { title, startTime, endTime, problems, difficulty, rules, allowedLanguages, maxAttempts, description, status } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: "Title, startTime, and endTime are required" });
        }

        const contest = new Contest({ 
            title, 
            startTime, 
            endTime, 
            problems: problems || [], 
            difficulty, 
            rules, 
            allowedLanguages, 
            maxAttempts, 
            description, 
            status 
        });

        await contest.save();
        res.status(201).json({ message: "Contest created successfully", contest });

    } catch (error) {
        res.status(500).json({ 
            error: "Failed to create contest", 
            details: error.message 
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
        res.status(500).json({ error: "Failed to update contest", details: error.message });
    }
});

// Get all contests (Auto-update contest status)
router.get("/", async (req, res) => {
    try {
        const now = new Date();
        const contests = await Contest.find().populate("problems");

        for (const contest of contests) {
            if (contest.status !== "Completed" && new Date(contest.endTime) < now) {
                contest.status = "Completed";
                await contest.save();
            }
        }

        res.json(contests);
    } catch (error) {
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
        res.status(500).json({ error: "Failed to fetch contest", details: error.message });
    }
});

// Fetch contest participants
router.get("/:id/participants", async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id);

        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        const participantStats = {
            totalParticipants: contest.totalParticipants || 0,
            clearedParticipants: contest.clearedParticipants || 0,
            failedParticipants: contest.failedParticipants || 0,
        };

        res.json(participantStats);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
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
        res.status(500).json({ error: "Failed to delete contest", details: error.message });
    }
});

module.exports = router;
