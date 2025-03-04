require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Connect to MongoDB
(async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
})();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL?.split(',') || '*', // Allow multiple frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({ message: "✅ API is running..." });
});

// Handle 404 Routes
app.use((req, res) => {
    res.status(404).json({ error: "❌ Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`❌ Server Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Handle Uncaught Errors
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
