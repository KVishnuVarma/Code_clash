const User = require('../models/User');
const Submission = require('../models/Submission');

// Update user streak when they solve a problem
const updateStreak = async (userId, problemId, pointsEarned, problemTopics = []) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        // Check for daily reset first
        user.checkDailyReset();

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if user already solved a problem today
        const todayProgress = user.streak.dailyProgress.find(
            progress => {
                const progressDate = new Date(progress.date);
                return progressDate.getTime() === today.getTime();
            }
        );

        if (todayProgress) {
            // User already solved a problem today, just update the count
            todayProgress.problemsSolved += 1;
            todayProgress.pointsEarned += pointsEarned;
            todayProgress.solved = true; // Mark as solved
            // Add topics if not already present
            problemTopics.forEach(topic => {
                if (!todayProgress.topicsSolved.includes(topic)) {
                    todayProgress.topicsSolved.push(topic);
                }
            });
        } else {
            // First problem solved today
            const isConsecutiveDay = user.streak.lastSolvedDate && 
                new Date(user.streak.lastSolvedDate).getTime() === yesterday.getTime();

            if (isConsecutiveDay) {
                // Consecutive day - increase streak
                user.streak.currentStreak += 1;
            } else if (user.streak.lastSolvedDate && 
                       new Date(user.streak.lastSolvedDate).getTime() < yesterday.getTime()) {
                // Streak broken - reset to 1
                user.streak.currentStreak = 1;
            } else {
                // First time solving or same day - set streak to 1
                user.streak.currentStreak = 1;
            }

            // Update longest streak if current is longer
            if (user.streak.currentStreak > user.streak.longestStreak) {
                user.streak.longestStreak = user.streak.currentStreak;
            }

            // Add today's progress
            user.streak.dailyProgress.push({
                date: today,
                problemsSolved: 1,
                pointsEarned: pointsEarned,
                topicsSolved: problemTopics,
                solved: true
            });

            // Update last solved date
            user.streak.lastSolvedDate = today;
        }

        // Update badge based on new streak count
        user.updateBadge();

        await user.save();
        return user.streak;
    } catch (error) {
        return null;
    }
};

// Get user streak information with real-time updates
const getUserStreak = async (req, res) => {
    try {
        const userId = req.user.id;
        // Getting streak for user
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check for daily reset
        const resetPerformed = user.checkDailyReset();

        // Calculate streak status for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayProgress = user.streak.dailyProgress.find(
            progress => {
                const progressDate = new Date(progress.date);
                return progressDate.getTime() === today.getTime();
            }
        );

        // Calculate top topics for the week
        const last7Days = user.streak.dailyProgress.slice(-7);
        const topicCounts = {};
        last7Days.forEach(day => {
            if (day.topicsSolved) {
                day.topicsSolved.forEach(topic => {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                });
            }
        });
        
        const topTopics = Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic, count]) => ({ topic, count }));

        // Get current time for countdown
        const now = new Date();
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const timeLeft = endOfDay.getTime() - now.getTime();
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        const streakData = {
            currentStreak: user.streak.currentStreak,
            longestStreak: user.streak.longestStreak,
            streakFreezes: user.streak.streakFreezes,
            badge: user.streak.badge,
            todaySolved: todayProgress ? todayProgress.problemsSolved : 0,
            todayPoints: todayProgress ? todayProgress.pointsEarned : 0,
            todaySolved: todayProgress ? todayProgress.solved : false,
            lastSolvedDate: user.streak.lastSolvedDate,
            dailyProgress: user.streak.dailyProgress.slice(-30), // Last 30 days
            topTopics: topTopics,
            timeLeft: {
                hours,
                minutes,
                seconds,
                total: timeLeft
            },
            resetPerformed
        };

        // Save user if reset was performed
        if (resetPerformed) {
            await user.save();
        }

        // Sending streak data
        res.json({ success: true, streak: streakData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch streak data' });
    }
};

// Manual streak freeze usage
const useStreakFreeze = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check for daily reset
        user.checkDailyReset();

        if (user.streak.streakFreezes <= 0) {
            return res.status(400).json({ error: 'No streak freezes available' });
        }

        if (user.streak.freezeUsed) {
            return res.status(400).json({ error: 'Freeze already used today' });
        }

        // Use streak freeze
        user.streak.streakFreezes -= 1;
        user.streak.freezeUsed = true;

        await user.save();

        res.json({ 
            success: true, 
            message: 'Streak freeze used successfully',
            streak: user.streak 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to use streak freeze' });
    }
};

// Get streak leaderboard
const getStreakLeaderboard = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('name email streak.currentStreak streak.longestStreak streak.badge points profilePicture department username')
            .sort({ 'streak.currentStreak': -1, 'streak.longestStreak': -1, points: -1 })
            .limit(10);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            name: user.name,
            email: user.email,
            currentStreak: user.streak.currentStreak,
            longestStreak: user.streak.longestStreak,
            badge: user.streak.badge,
            points: user.points,
            profilePicture: user.profilePicture,
            department: user.department,
            username: user.username
        }));

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

// Get calendar data for the current month
const getCalendarData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { year, month } = req.query;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check for daily reset
        user.checkDailyReset();

        const targetYear = parseInt(year) || new Date().getFullYear();
        const targetMonth = parseInt(month) || new Date().getMonth();

        // Get all progress for the target month
        const monthProgress = user.streak.dailyProgress.filter(progress => {
            const progressDate = new Date(progress.date);
            return progressDate.getFullYear() === targetYear && 
                   progressDate.getMonth() === targetMonth;
        });

        // Create calendar data
        const firstDay = new Date(targetYear, targetMonth, 1);
        const lastDay = new Date(targetYear, targetMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const calendar = [];
        let dayCount = 1;

        for (let week = 0; week < 6; week++) {
            const weekData = [];
            for (let day = 0; day < 7; day++) {
                if ((week === 0 && day < startDay) || dayCount > daysInMonth) {
                    weekData.push(null);
                } else {
                    const currentDate = new Date(targetYear, targetMonth, dayCount);
                    const dayProgress = monthProgress.find(progress => {
                        const progressDate = new Date(progress.date);
                        return progressDate.getTime() === currentDate.getTime();
                    });

                    weekData.push({
                        day: dayCount,
                        date: currentDate,
                        solved: dayProgress ? dayProgress.solved : false,
                        problemsSolved: dayProgress ? dayProgress.problemsSolved : 0,
                        pointsEarned: dayProgress ? dayProgress.pointsEarned : 0,
                        topicsSolved: dayProgress ? dayProgress.topicsSolved : []
                    });
                    dayCount++;
                }
            }
            calendar.push(weekData);
        }

        res.json({ success: true, calendar });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch calendar data' });
    }
};

module.exports = {
    updateStreak,
    getUserStreak,
    useStreakFreeze,
    getStreakLeaderboard,
    getCalendarData
}; 