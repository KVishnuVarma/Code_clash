const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT and extract user info
const authMiddleware = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Ensure request proceeds
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Admin Middleware
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

// @route    POST /api/auth/register
// @desc     Register a new user
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
            user: { id: user.id, name, email, role: user.role },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route    POST /api/auth/login
// @desc     Authenticate user & get token
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
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route    GET /api/auth/user
// @desc     Get user details (Requires authentication)
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route    GET /api/auth/admin/users
// @desc     Get all users (Admin only)
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route    PUT /api/auth/admin/suspend/:userId
// @desc     Suspend or unsuspend a user (Admin only)
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

// @route    GET /api/auth/admin
// @desc     Protected admin route
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        res.json({ message: "Welcome, Admin!" });
    } catch (err) {
        console.error("Error accessing admin route:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
