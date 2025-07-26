// const Contest = require('../models/Contest'); 
const Problem = require('../models/Problem'); 
const User = require('../models/User'); 
const Violation = require('../models/Violation');

const createContest = async (req, res) => {
    try {
        const { title, description, startDate, endDate } = req.body;

        if (!title || !description || !startDate || !endDate) {
            return res.status(400).json({ error: '❌ All fields are required' });
        }

        const newContest = new Contest({ title, description, startDate, endDate });
        await newContest.save();

        res.status(201).json({ message: '✅ Contest created successfully', contest: newContest });
    } catch (error) {
        res.status(500).json({ error: '❌ Error creating contest', details: error.message });
    }
};

const uploadProblem = async (req, res) => {
    try {
        const { title, description, testCases, difficulty, contestId } = req.body;
        // testCases may now include explanation for each test case

        if (!title || !description || !testCases || !difficulty || !contestId) {
            return res.status(400).json({ error: '❌ All fields are required' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ error: '❌ Contest not found' });
        }

        const newProblem = new Problem({ title, description, testCases, difficulty, contest: contestId });
        await newProblem.save();

        res.status(201).json({ message: '✅ Problem uploaded successfully', problem: newProblem });
    } catch (error) {
        res.status(500).json({ error: '❌ Error uploading problem', details: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ message: '✅ Users retrieved successfully', users });
    } catch (error) {
        res.status(500).json({ error: '❌ Server Error', details: error.message });
    }
};

const monitorUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: '❌ User not found' });
        }

        const cheatingDetected = Math.random() > 0.8; 

        res.json({ message: '✅ User activity monitored', user, cheatingDetected });
    } catch (error) {
        res.status(500).json({ error: '❌ Server Error', details: error.message });
    }
};

const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '❌ User not found' });
        }

        user.isSuspended = true;
        await user.save();

        res.json({ message: '🚫 User suspended successfully', user });
    } catch (error) {
        res.status(500).json({ error: '❌ Server Error', details: error.message });
    }
};

const unsuspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '❌ User not found' });
        }

        user.isSuspended = user.isSuspended ? false : true;
        await user.save();

        res.json({ message: '✅ User unsuspended successfully', user });
    } catch (error) {
        res.status(500).json({ error: '❌ Server Error', details: error.message });
    }
};

const reportViolation = async (req, res) => {
    try {
        const { userId, examId, violation, timestamp } = req.body;
        console.log('🚨 VIOLATION REPORTED:', { userId, examId, violation, timestamp });
        if (!userId || !violation) {
            console.log('❌ Missing userId or violation data');
            return res.status(400).json({ error: 'User ID and violation are required.' });
        }
        // Store violation in DB
        await Violation.create({ userId, examId, violation, timestamp });
        // Suspend the user
        const user = await User.findById(userId);
        if (user) {
            user.isSuspended = true;
            await user.save();
            console.log('✅ User suspended successfully. New isSuspended:', user.isSuspended);
        } else {
            console.log('❌ User not found with ID:', userId);
        }
        res.json({ message: 'Violation reported, stored, and user suspended.' });
    } catch (error) {
        console.error('❌ Error in reportViolation:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const getViolations = async (req, res) => {
    try {
        const violations = await Violation.find().sort({ timestamp: -1 }).populate('userId', 'name email');
        res.json({ violations });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { 
    createContest, 
    uploadProblem, 
    getAllUsers, 
    monitorUserActivity, 
    suspendUser, 
    unsuspendUser, 
    reportViolation, 
    getViolations 
};
