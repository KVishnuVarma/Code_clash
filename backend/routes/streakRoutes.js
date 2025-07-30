const express = require('express');
const { getUserStreak, useStreakFreeze, getStreakLeaderboard, getCalendarData } = require('../controllers/streakController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's streak information
router.get('/user', authenticateUser, getUserStreak);

// Get calendar data for a specific month
router.get('/calendar', authenticateUser, getCalendarData);

// Use streak freeze
router.post('/freeze', authenticateUser, useStreakFreeze);

// Get streak leaderboard
router.get('/leaderboard', getStreakLeaderboard);

module.exports = router; 