const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
    try {
        let token = req.header("x-auth-token") || req.header("Authorization");

        if (!token) {
            return res.status(401).json({ error: "Access Denied! No Token Provided" });
        }

        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isSuspended) {
            return res.status(403).json({ error: "Your account is suspended. Contact admin." });
        }

        req.user.role = user.role;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or Expired Token" });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized. Please log in again." });
        }

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
