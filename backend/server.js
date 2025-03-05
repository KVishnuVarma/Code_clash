require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const connectDB = require("./config/db");

// Initialize Express App
const app = express();

// Connect to MongoDB
(async () => {
    try {
        await connectDB();
        console.log("\u2705 MongoDB Connected Successfully");
    } catch (err) {
        console.error("\u274C MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
})();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL?.split(",") || "*", // Allow multiple frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        (accessToken, refreshToken, profile, done) => {
            console.log("GitHub Profile:", profile);
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// GitHub Auth Routes
app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", {
        successRedirect: process.env.FRONTEND_URL + "/dashboard",
        failureRedirect: process.env.FRONTEND_URL + "/login"
    })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({ message: "\u2705 API is running..." });
});

// Handle 404 Routes
app.use((req, res) => {
    res.status(404).json({ error: "\u274C Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`\u274C Server Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\uD83D\uDE80 Server running on port ${PORT}`));

// Handle Uncaught Errors
process.on("unhandledRejection", (err) => {
    console.error("\u274C Unhandled Promise Rejection:", err.message);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("\u274C Uncaught Exception:", err.message);
    process.exit(1);
});
