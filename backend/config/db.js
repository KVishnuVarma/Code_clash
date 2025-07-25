const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("⚠️ MONGO_URI is missing. Check your .env file.");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected...");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
