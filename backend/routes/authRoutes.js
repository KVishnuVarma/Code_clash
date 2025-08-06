const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

// Google OAuth authentication
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // Decode the JWT token from Google
        const decoded = jwt.decode(credential);
        
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid Google credential' });
        }
        
        const { email, name, picture, sub: googleId } = decoded;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists, check if suspended
            if (user.isSuspended) {
                return res.status(403).json({ message: "Your account is suspended. Contact admin." });
            }

            // Update user's Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                name,
                email,
                googleId,
                role: 'user',
                activityLog: [],
                isSuspended: false,
                profilePicture: picture
            });
            await user.save();
        }

        // Log the activity
        user.activityLog.push(`User logged in with Google at ${new Date().toISOString()}`);
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const responseData = { 
            token, 
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isSuspended: user.isSuspended,
                theme: user.theme,
                darkMode: user.darkMode,
                profilePicture: user.profilePicture
            },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        };
        
        res.json(responseData);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            activityLog: [],
            isSuspended: false
        });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            token, 
            user: { 
                _id: user._id, 
                name, 
                email, 
                role: user.role,
                theme: user.theme,
                darkMode: user.darkMode
            },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ message: "Your account is suspended. Contact admin." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        user.activityLog.push(`User logged in at ${new Date().toISOString()}`);
        await user.save();

        res.json({ 
            token, 
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isSuspended: user.isSuspended,
                theme: user.theme,
                darkMode: user.darkMode
            },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get current user data
router.get('/user', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/admin/users', authenticateUser, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/admin/suspend/:userId', authenticateUser, adminMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isSuspended } = req.body;

        if (typeof isSuspended !== 'boolean') {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isSuspended = isSuspended;
        await user.save();

        return res.status(200).json({ message: "User status updated", user });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/admin', authenticateUser, adminMiddleware, async (req, res) => {
    try {
        res.json({ message: "Welcome, Admin!" });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get("/api/leaderboard", async (req, res) => {
    try {
        const leaderboard = await User.find({ role: "user" }).sort({ points: -1 }); // ✅ Exclude admins
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Theme preference endpoints
router.put('/theme', authenticateUser, async (req, res) => {
    try {
        const { theme, darkMode } = req.body;
        
        if (theme && !['zinc', 'slate', 'stone', 'blue', 'emerald', 'purple'].includes(theme)) {
            return res.status(400).json({ message: 'Invalid theme' });
        }
        
        if (darkMode !== undefined && typeof darkMode !== 'boolean') {
            return res.status(400).json({ message: 'Invalid darkMode value' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (theme !== undefined) user.theme = theme;
        if (darkMode !== undefined) user.darkMode = darkMode;
        
        await user.save();

        res.json({ 
            message: 'Theme preferences updated',
            theme: user.theme,
            darkMode: user.darkMode
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/theme', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('theme darkMode');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            theme: user.theme,
            darkMode: user.darkMode
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get user profile data
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('solvedProblems.problemId', 'title difficulty category')
            .populate('problemScores.problemId', 'title difficulty category');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Aggregate submission statistics for the past year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissions = await Submission.find({
            userId: req.user.id,
            submittedAt: { $gte: oneYearAgo }
        }).sort({ submittedAt: 1 });

        // Group submissions by date
        const submissionHistory = {};
        let totalSubmissions = 0;
        let acceptedSubmissions = 0;
        const activeDays = new Set();

        submissions.forEach(submission => {
            const dateStr = submission.submittedAt.toISOString().split('T')[0];
            
            if (!submissionHistory[dateStr]) {
                submissionHistory[dateStr] = 0;
            }
            submissionHistory[dateStr]++;
            
            totalSubmissions++;
            activeDays.add(dateStr);
            
            if (submission.status === 'Accepted') {
                acceptedSubmissions++;
            }
        });

        // Convert submissionHistory to array format expected by frontend
        const submissionHistoryArray = Object.entries(submissionHistory).map(([date, count]) => ({
            date: new Date(date),
            submissions: count
        }));

        // Calculate max streak
        let maxStreak = 0;
        let currentStreak = 0;
        const sortedDates = Object.keys(submissionHistory).sort();
        
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0 || isConsecutiveDay(sortedDates[i-1], sortedDates[i])) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
        }

        // Add submission statistics to user object
        const userWithStats = user.toObject();
        userWithStats.submissionStats = {
            totalSubmissions,
            acceptedSubmissions,
            activeDays: activeDays.size,
            maxStreak,
            submissionHistory: submissionHistoryArray
        };

        res.json(userWithStats);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Helper function to check if two dates are consecutive
function isConsecutiveDay(date1Str, date2Str) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

// Get public user profile by username
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({ username })
            .select('-password -email -phone -activityLog')
            .populate('solvedProblems.problemId', 'title difficulty category')
            .populate('problemScores.problemId', 'title difficulty category');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching public user profile:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update user profile
router.put('/profile', authenticateUser, [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').notEmpty(),
    check('department', 'Department is required').notEmpty(),
    check('state', 'State is required').notEmpty(),
    check('country', 'Country is required').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, phone, department, state, country } = req.body;
        
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.phone = phone;
        user.department = department;
        user.state = state;
        user.country = country;

        await user.save();

        // Log the activity
        user.activityLog.push(`Profile updated at ${new Date().toISOString()}`);
        await user.save();

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                department: user.department,
                state: user.state,
                country: user.country,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Enhanced profile update (LeetCode-style)
router.put('/profile/enhanced', authenticateUser, [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { 
            name, 
            email, 
            bio, 
            location, 
            education, 
            portfolio, 
            github, 
            linkedin, 
            skills 
        } = req.body;
        
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.name = name;
        user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (education !== undefined) user.education = education;
        if (portfolio !== undefined) user.portfolio = portfolio;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (skills !== undefined) user.skills = skills;

        await user.save();

        // Log the activity
        user.activityLog.push(`Enhanced profile updated at ${new Date().toISOString()}`);
        await user.save();

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                location: user.location,
                education: user.education,
                portfolio: user.portfolio,
                github: user.github,
                linkedin: user.linkedin,
                skills: user.skills,
                profilePicture: user.profilePicture,
                username: user.username,
                rank: user.rank
            }
        });
    } catch (err) {
        console.error('Error updating enhanced profile:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Generate unique username
router.post('/generate-username', authenticateUser, async (req, res) => {
    try {
        const { baseName } = req.body;
        if (!baseName) {
            return res.status(400).json({ message: 'Base name is required' });
        }

        let username = baseName.replace(/\s+/g, '_').toLowerCase();
        let counter = 1;
        let finalUsername = username;

        // Check if username exists and generate a unique one
        while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}_${counter}`;
            counter++;
        }

        res.json({ username: finalUsername });
    } catch (err) {
        console.error('Error generating username:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update profile picture
router.put('/profile-picture', authenticateUser, async (req, res) => {
    try {
        const { profilePicture } = req.body;
        
        if (!profilePicture) {
            return res.status(400).json({ message: 'Profile picture URL is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePicture = profilePicture;
        await user.save();

        // Log the activity
        user.activityLog.push(`Profile picture updated at ${new Date().toISOString()}`);
        await user.save();

        res.json({ 
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (err) {
        console.error('Error updating profile picture:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get user statistics
router.get('/statistics', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('solvedProblems.problemId', 'difficulty')
            .populate('problemScores.problemId', 'difficulty');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Get all problems for denominator
        const allProblems = await Problem.find({}, 'difficulty');
        const totalEasy = allProblems.filter(p => p.difficulty === 'Easy').length;
        const totalMedium = allProblems.filter(p => p.difficulty === 'Medium').length;
        const totalHard = allProblems.filter(p => p.difficulty === 'Hard').length;
        const totalProblemsAll = allProblems.length;
        
        // User's solved problems by difficulty
        const easyProblems = user.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Easy').length;
        const mediumProblems = user.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Medium').length;
        const hardProblems = user.solvedProblems.filter(p => p.problemId && p.problemId.difficulty === 'Hard').length;

        // Calculate submission statistics
        const totalSubmissions = user.submissionStats.totalSubmissions || 0;
        const acceptedSubmissions = user.submissionStats.acceptedSubmissions || 0;
        const activeDays = user.submissionStats.activeDays || 0;
        const maxStreak = user.submissionStats.maxStreak || 0;

        const statistics = {
            totalProblems: user.solvedProblems.length,
            easyProblems,
            mediumProblems,
            hardProblems,
            totalEasy,
            totalMedium,
            totalHard,
            totalProblemsAll,
            totalSubmissions,
            acceptedSubmissions,
            activeDays,
            maxStreak,
            currentStreak: user.streak.currentStreak,
            longestStreak: user.streak.longestStreak,
            points: user.points,
            rank: user.rank,
            badge: user.streak.badge
        };
        
        res.json(statistics);
    } catch (err) {
        console.error('Error fetching user statistics:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Change password
router.put('/change-password', authenticateUser, [
    check('currentPassword', 'Current password is required').notEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        // Log the activity
        user.activityLog.push(`Password changed at ${new Date().toISOString()}`);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
