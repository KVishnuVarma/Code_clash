require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const connectDB = require("./config/db");

const app = express();

(async () => {
    try {
        await connectDB();
    } catch (err) {
        console.error("\u274C MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
})();

const deployedFrontend = "https://codeclashv.vercel.app"; // Updated deployed frontend URL
const localFrontend = "http://localhost:5173";

if (!process.env.FRONTEND_URL) {
    console.warn("\u26A0\uFE0F FRONTEND_URL is not set in environment variables. Using default frontends for CORS.");
}

const allowedOrigins = [
    process.env.FRONTEND_URL || deployedFrontend,
    deployedFrontend,
    localFrontend,
    "http://localhost:3000", 
    "https://codeclashv.vercel.app", 
    "https://accounts.google.com", 
    "https://oauth2.googleapis.com", 
    "https://www.googleapis.com", 
    "https://google.com", 
    "https://www.google.com" 
];


app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Origin', 'Accept']
}));

// Handle preflight requests for all routes
app.options("*", cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());


app.use(session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("GitHub Profile:", profile);
                return done(null, profile);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", {
        successRedirect: process.env.FRONTEND_URL + "/dashboard",
        failureRedirect: process.env.FRONTEND_URL + "/login"
    })
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/aihelp", require("./routes/aiHelpRoutes"));
app.use("/api/streak", require("./routes/streakRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

app.get("/", (req, res) => {
    res.status(200).json({ message: "\u2705 API is running..." });
});

app.use((req, res) => {
    res.status(404).json({ error: "\u274C Route not found" });
});

app.use((err, req, res, next) => {
    console.error(`\u274C Server Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const { initializeSocket } = require('./services/socketService');

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware to attach io to req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

server.listen(PORT, "0.0.0.0", () => console.log(`\uD83D\uDE80 Server running on port ${PORT}`));

process.on("unhandledRejection", (err) => {
    console.error("\u274C Unhandled Promise Rejection:", err.message);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("\u274C Uncaught Exception:", err.message);
    process.exit(1);
});
