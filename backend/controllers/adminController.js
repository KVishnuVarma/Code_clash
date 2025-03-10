// const Contest = require('../models/Contest'); 
const Problem = require('../models/Problem'); 
const User = require('../models/User'); 

// const createContest = async (req, res) => {
//     try {
//         const { title, description, startDate, endDate } = req.body;

//         if (!title || !description || !startDate || !endDate) {
//             return res.status(400).json({ error: '❌ All fields are required' });
//         }

//         const newContest = new Contest({ title, description, startDate, endDate });
//         await newContest.save();

//         res.status(201).json({ message: '✅ Contest created successfully', contest: newContest });
//     } catch (error) {
//         res.status(500).json({ error: '❌ Error creating contest', details: error.message });
//     }
// };

// const uploadProblem = async (req, res) => {
//     try {
//         const { title, description, testCases, difficulty, contestId } = req.body;

//         if (!title || !description || !testCases || !difficulty || !contestId) {
//             return res.status(400).json({ error: '❌ All fields are required' });
//         }

//         const contest = await Contest.findById(contestId);
//         if (!contest) {
//             return res.status(404).json({ error: '❌ Contest not found' });
//         }

//         const newProblem = new Problem({ title, description, testCases, difficulty, contest: contestId });
//         await newProblem.save();

//         res.status(201).json({ message: '✅ Problem uploaded successfully', problem: newProblem });
//     } catch (error) {
//         res.status(500).json({ error: '❌ Error uploading problem', details: error.message });
//     }
// };

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

module.exports = { 
    // createContest, 
    // uploadProblem, 
    getAllUsers, 
    monitorUserActivity, 
    suspendUser, 
    unsuspendUser 
};
