const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Contest = require("../models/Contest");
const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");
const { authenticateUser } = require("../middleware/authMiddleware");

// Create a new contest
router.post("/", async (req, res) => {
    console.log("hit")
    console.log("Request body:", JSON.stringify(req.body, null, 2))
    console.log("MCQ Problems:", JSON.stringify(req.body.mcqProblems, null, 2))

    try {
        const { 
            title, 
            startTime, 
            endTime, 
            problems, 
            mcqProblems,
            difficulty, 
            rules, 
            allowedLanguages, 
            maxAttempts, 
            description, 
            status,
            prizes 
        } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ error: "Title, startTime, and endTime are required" });
        }

        // Ensure mcqProblems is properly formatted
        const formattedMcqProblems = mcqProblems && mcqProblems.length > 0 
            ? mcqProblems.map(problem => ({
                question: problem.question,
                options: problem.options,
                correctOption: problem.correctOption,
                points: problem.points || 10
            }))
            : [];
            
        console.log("Formatted MCQ Problems:", JSON.stringify(formattedMcqProblems, null, 2));
        
        const contest = new Contest({ 
            title, 
            startTime, 
            endTime, 
            problems: problems || [], 
            mcqProblems: formattedMcqProblems,
            difficulty, 
            rules, 
            allowedLanguages, 
            maxAttempts, 
            description, 
            status,
            prizes: prizes || {
                top3: "CodeClash Backpack",
                top10: "CodeClash Water Bottle",
                special: "CodeClash Big O Notebook",
                specialPositions: [62, 462, 1024, 1337, 2048]
            }
        });

        const savedContest = await contest.save();
        console.log("Saved contest:", JSON.stringify(savedContest, null, 2));
        console.log("Saved MCQ Problems:", JSON.stringify(savedContest.mcqProblems, null, 2));
        res.status(201).json({ message: "Contest created successfully", contest: savedContest });

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
        console.log("Updating contest with ID:", req.params.id);
        console.log("Update data:", JSON.stringify(req.body, null, 2));
        
        // Format mcqProblems if present
        let updateData = req.body;
        if (updateData.mcqProblems) {
            updateData.mcqProblems = updateData.mcqProblems.map(problem => ({
                question: problem.question,
                options: problem.options,
                correctOption: problem.correctOption,
                points: problem.points || 10
            }));
        }
        
        const updatedContest = await Contest.findByIdAndUpdate(
            req.params.id,
            updateData,
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
        console.log("Fetching all contests");
        
        // First get all contests to update their status if needed
        const allContests = await Contest.find();
        
        // Update contest status based on current time
        let updatedContests = [];
        for (const contest of allContests) {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(contest.endTime);
            
            let statusUpdated = false;
            if (contest.status !== "Completed" && endTime < now) {
                contest.status = "Completed";
                statusUpdated = true;
            } else if (contest.status !== "Ongoing" && startTime <= now && endTime >= now) {
                contest.status = "Ongoing";
                statusUpdated = true;
            }
            
            if (statusUpdated) {
                await contest.save();
                updatedContests.push(contest._id);
            }
        }
        
        if (updatedContests.length > 0) {
            console.log(`Updated status for ${updatedContests.length} contests`);
        }
        
        // Now get all contests with populated fields
        const contests = await Contest.find()
            .populate({
                path: "problems.problemId",
                select: "title difficulty"
            });
            
        console.log(`Found ${contests.length} contests`);
        // Log mcqProblems for each contest
        contests.forEach((contest, index) => {
            console.log(`Contest ${index + 1} (${contest.title}) MCQ Problems:`, 
                contest.mcqProblems ? contest.mcqProblems.length : 0);
        });

        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contests", details: error.message });
    }
});

// Get a single contest by ID
router.get("/:id", async (req, res) => {
    try {
        console.log("Fetching contest with ID:", req.params.id);
        // First get the contest without lean() so we can update it if needed
        const contest = await Contest.findById(req.params.id);
        
        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }
        
        // Update contest status based on current time
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        
        let statusUpdated = false;
        if (contest.status !== "Completed" && endTime < now) {
            contest.status = "Completed";
            statusUpdated = true;
        } else if (contest.status !== "Ongoing" && startTime <= now && endTime >= now) {
            contest.status = "Ongoing";
            statusUpdated = true;
        }
        
        // Save if status was updated
        if (statusUpdated) {
            await contest.save();
        }
        
        // Now populate and return the contest
        const populatedContest = await Contest.findById(req.params.id)
            .populate({
                path: "problems.problemId",
                select: "title description difficulty testCases languages topics"
            })
            .populate({
                path: "participants.userId",
                select: "username email"
            });
        
        console.log("Contest found:", populatedContest ? "Yes" : "No");
        if (populatedContest) {
            console.log("MCQ Problems in contest:", JSON.stringify(populatedContest.mcqProblems, null, 2));
        }

        res.json(populatedContest);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch contest", details: error.message });
    }
});

// Submit MCQ answers for a contest
router.post("/:id/mcq-submit", authenticateUser, async (req, res) => {
    try {
        const contestId = req.params.id;
        const userId = req.user.id;
        const { selectedOptions, score } = req.body;
        
        if (!contestId || !userId || !selectedOptions || score === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Find the contest
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }
        
        // Check if user is registered for the contest
        const participantIndex = contest.participants.findIndex(p => 
            p.userId && p.userId.toString() === userId.toString());
            
        if (participantIndex === -1) {
            return res.status(403).json({ error: "User not registered for this contest" });
        }
        
        // Update participant's score
        contest.participants[participantIndex].score += score;
        
        // Save the updated contest
        await contest.save();
        
        res.status(200).json({ 
            message: "MCQ answers submitted successfully",
            score: score,
            totalScore: contest.participants[participantIndex].score
        });
    } catch (error) {
        console.error("Error submitting MCQ answers:", error);
        res.status(500).json({ error: "Failed to submit MCQ answers", details: error.message });
    }
});

// Fetch contest participants and stats
router.get("/:id/participants", async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id)
            .populate({
                path: "participants.userId",
                select: "username email"
            });

        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        // Sort participants by score (descending) and update ranks
        contest.participants.sort((a, b) => b.score - a.score);
        
        // Update ranks based on sorted order
        contest.participants.forEach((participant, index) => {
            participant.rank = index + 1;
        });
        await contest.save();

        const participantStats = {
            totalParticipants: contest.totalParticipants || 0,
            clearedParticipants: contest.clearedParticipants || 0,
            failedParticipants: contest.failedParticipants || 0,
            participants: contest.participants
        };

        res.json(participantStats);
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
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

// Register for a contest
// Register for a contest
router.post("/:id/register", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // First, find the user to ensure they exist
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ error: "User not found" });
        }
        // Find contest and populate participants
        const contest = await Contest.findById(id).populate({
            path: 'participants.userId',
            select: '_id username'
        });
        
        if (!contest) {
            console.log('Contest not found:', id);
            return res.status(404).json({ error: "Contest not found" });
        }

        // Check if user is already registered with safer comparison
        const isRegistered = Array.isArray(contest.participants) && contest.participants.some(p => {
            try {
                if (!p || !p.userId) {
                    console.log('Invalid participant entry:', p);
                    return false;
                }
                
                let participantId;
                if (typeof p.userId === 'object' && p.userId !== null) {
                    // Handle populated user case
                    participantId = p.userId._id ? p.userId._id.toString() : p.userId.toString();
                } else {
                    // Handle unpopulated user case
                    participantId = p.userId.toString();
                }
                
                const currentUserId = user._id.toString();
                console.log('Comparing IDs:', { participantId, currentUserId });
                return participantId === currentUserId;
            } catch (err) {
                console.error('Error comparing participant:', err);
                return false;
            }
        });

        if (isRegistered) {
            console.log('User already registered:', { userId: user._id.toString() });
            return res.status(400).json({ error: "Already registered for this contest" });
        }

        // Create participant data with the user's existing ObjectId
        const participantData = {
            userId: user._id,  // Use the existing ObjectId from the user document
            joinedAt: new Date(),
            score: 0,
            solvedProblems: [],
            submissions: []
        };

        // Add participant with validation
        try {
            if (!mongoose.Types.ObjectId.isValid(user._id)) {
                throw new Error('Invalid user ID format');
            }

            // Initialize participants array if it doesn't exist
            if (!contest.participants) {
                contest.participants = [];
            }

            // Create a new mongoose ObjectId from user._id to ensure proper type
            const userId = new mongoose.Types.ObjectId(user._id);
            participantData.userId = userId;

            contest.participants.push(participantData);
            contest.totalParticipants = (contest.totalParticipants || 0) + 1;

            // Save without validation first to ensure it works
            const savedContest = await contest.save();
            
            if (!savedContest) {
                throw new Error('Failed to save contest');
            }
        } catch (saveError) {
            console.error('Error saving contest:', {
                error: saveError.message,
                stack: saveError.stack,
                validationErrors: saveError.errors
            });
            throw new Error(`Failed to save contest: ${saveError.message}`);
        }

        res.status(200).json({ 
            message: "Successfully registered for contest",
            contestId: contest._id,
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: "Failed to register for contest", 
            details: error.message
        });
    }
});

// Submit a solution for a contest problem
router.post("/:contestId/problems/:problemId/submit", authenticateUser, async(req, res) => {
    console.log("Submitting solution for contest problem");
    try {
        const { contestId, problemId } = req.params;
        const { code, language } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!code || !language) {
            return res.status(400).json({ error: "Code and language are required" });
        }

        // Find contest and check if user is registered
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        // Check if contest is ongoing
        const now = new Date();
        if (new Date(contest.startTime) > now || new Date(contest.endTime) < now) {
            return res.status(400).json({ error: "Contest is not active" });
        }

        // Check if problem belongs to this contest
        const contestProblem = contest.problems.find(p => p.problemId.toString() === problemId);
        if (!contestProblem) {
            return res.status(404).json({ error: "Problem not found in this contest" });
        }

        // Find the problem to get test cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        // TODO: Implement actual code execution and testing logic
        // This would typically involve running the code against test cases
        // For now, we'll simulate a submission result

        const submission = new Submission({
            userId,
            problemId,
            language,
            code,
            status: "Accepted", // This would be determined by actual test results
            testResults: problem.testCases.map(tc => ({
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: tc.output, // Simulated correct output
                passed: true,
                executionTime: Math.random() * 100 // Simulated execution time
            })),
            metrics: {
                totalTests: problem.testCases.length,
                passedTests: problem.testCases.length,
                executionTime: Math.random() * 500,
                score: contestProblem.points,
                timeTaken: Math.random() * 300
            }
        });

        await submission.save();

        // Update participant's score and solved problems
        const participantIndex = contest.participants.findIndex(p => p.userId.toString() === userId.toString());
        if (participantIndex !== -1) {
            const participant = contest.participants[participantIndex];
            
            // Check if problem was already solved by this participant
            if (!participant.solvedProblems.includes(problemId)) {
                participant.score += contestProblem.points;
                participant.solvedProblems.push(problemId);
            }
            
            participant.submissions.push(submission._id);
            await contest.save();
        }

        // Update problem statistics
        problem.statistics.totalSubmissions += 1;
        problem.statistics.successfulSubmissions += 1;
        
        if (!problem.attemptedUsers.includes(userId)) {
            problem.attemptedUsers.push(userId);
            problem.statistics.totalParticipants += 1;
        }
        
        if (!problem.solvedUsers.includes(userId)) {
            problem.solvedUsers.push(userId);
        }
        
        await problem.save();

        res.status(200).json({
            message: "Solution submitted successfully",
            submission: submission
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit solution", details: error.message });
    }
});

// Get contest leaderboard
router.get("/:id/leaderboard", async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id)
            .populate({
                path: "participants.userId",
                select: "username email"
            });

        if (!contest) {
            return res.status(404).json({ error: "Contest not found" });
        }

        // Sort participants by score (descending)
        const leaderboard = [...contest.participants]
            .sort((a, b) => b.score - a.score)
            .map((participant, index) => ({
                rank: index + 1,
                username: participant.userId.username,
                score: participant.score,
                solvedCount: participant.solvedProblems.length
            }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard", details: error.message });
    }
});

module.exports = router;
