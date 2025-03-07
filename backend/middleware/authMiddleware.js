const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to authenticate users (Regular + Admin)
const authenticateUser = async (req, res, next) => {
    let token = req.header("x-auth-token") || req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access Denied! No Token Provided" });
    }

    try {
        // Support both "Bearer <TOKEN>" and raw token
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1]; 
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;

        // Fetch user details from DB to check status
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🚨 Check if the user is suspended
        if (user.isSuspended) {
            return res.status(403).json({ error: "Your account is suspended. Contact admin." });
        }

        next();
    } catch (err) {
        return res.status(400).json({ error: "Invalid Token" });
    }
};

// ✅ Middleware to allow only Admins
const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Access Denied! Admins Only" });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { authenticateUser, adminMiddleware };
