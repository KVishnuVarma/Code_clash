const express = require("express");
const router = express.Router();
const Contest = require("../models/contest");

// Create a new contest
router.post("/", async (req, res) => {
    try {
        const { title, startTime, endTime, problems } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: "Title, startTime, and endTime are required" });
        }

        const contest = new Contest({ title, startTime, endTime, problems });
        await contest.save();
        res.status(201).json({ message: "Contest created successfully", contest });
    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: "Error creating contest", details: error.message });
    }
});

// Update an existing contest
router.put("/:id", async (req, res) => {
    try {
        const updatedContest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });

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

// Additional endpoints
router.get("/api/contests", async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contests" });
    }
});

router.post("/api/contests", async (req, res) => {
    try {
        const contest = new Contest(req.body);
        await contest.save();
        res.status(201).json({ message: "Contest created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating contest" });
    }
});

module.exports = router;