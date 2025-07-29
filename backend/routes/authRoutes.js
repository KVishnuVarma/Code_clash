const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const authMiddleware = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

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
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isSuspended: user.isSuspended,
                theme: user.theme,
                darkMode: user.darkMode,
                profilePicture: user.profilePicture
            },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (err) {
        console.error("Error in Google authentication:", err);
        res.status(500).json({ message: 'Server Error' });
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

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { 
                id: user.id, 
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

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.activityLog.push(`User logged in at ${new Date().toISOString()}`);
        await user.save();

        res.json({ 
            token, 
            user: { 
                id: user.id, 
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
        console.error("Error logging in:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get current user data
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/admin/suspend/:userId', authMiddleware, adminMiddleware, async (req, res) => {
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        res.json({ message: "Welcome, Admin!" });
    } catch (err) {
        console.error("Error accessing admin route:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get("/api/leaderboard", async (req, res) => {
    try {
        const leaderboard = await User.find({ role: "user" }).sort({ points: -1 }); // ✅ Exclude admins
        res.json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Theme preference endpoints
router.put('/theme', authMiddleware, async (req, res) => {
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
        console.error("Error updating theme preferences:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/theme', authMiddleware, async (req, res) => {
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
        console.error("Error fetching theme preferences:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
