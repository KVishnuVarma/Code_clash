const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    department: String,
    state: String,
    country: String,
    password: String,
    googleId: String, // Google OAuth ID
    profilePicture: String, // Google profile picture URL
    points: { type: Number, default: 0 },
    solvedProblems: [{
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        solvedAt: { type: Date, default: Date.now }
    }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isSuspended: { type: Boolean, default: false },
    activityLog: [{ type: String, default: [] }],
    theme: { type: String, default: 'zinc' },
    darkMode: { type: Boolean, default: true },
    problemScores: [{
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        score: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 }, // in seconds
        attempts: { type: Number, default: 0 }
    }],
    // Enhanced Streak tracking fields
    streak: {
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastSolvedDate: { type: Date },
        lastCheckedDate: { type: Date }, // Track when we last checked for daily reset
        streakFreezes: { type: Number, default: 0 }, // Number of streak freezes available
        freezeUsed: { type: Boolean, default: false }, // Track if freeze was used today
        badge: { 
            type: String, 
            enum: ['none', 'bronze', 'silver', 'gold', 'premium'], 
            default: 'none' 
        },
        dailyProgress: [{
            date: { type: Date, required: true },
            problemsSolved: { type: Number, default: 0 },
            pointsEarned: { type: Number, default: 0 },
            topicsSolved: [{ type: String }], // Track topics solved each day
            solved: { type: Boolean, default: false } // Track if any problem was solved
        }]
    }
});

// Method to update badge based on streak count
UserSchema.methods.updateBadge = function() {
    const streak = this.streak.currentStreak;
    
    if (streak >= 90) {
        this.streak.badge = 'premium';
        this.streak.streakFreezes = 0; // Premium users don't need freezes
    } else if (streak >= 60) {
        this.streak.badge = 'gold';
        this.streak.streakFreezes = 5;
    } else if (streak >= 30) {
        this.streak.badge = 'gold';
        this.streak.streakFreezes = 3;
    } else if (streak >= 15) {
        this.streak.badge = 'silver';
        this.streak.streakFreezes = 2;
    } else if (streak >= 7) {
        this.streak.badge = 'bronze';
        this.streak.streakFreezes = 1;
    } else {
        this.streak.badge = 'none';
        this.streak.streakFreezes = 0;
    }
};

// Method to check if daily reset is needed (11:59 PM to 12:00 AM)
UserSchema.methods.checkDailyReset = function() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If we haven't checked today yet
    if (!this.streak.lastCheckedDate || 
        new Date(this.streak.lastCheckedDate).getTime() !== today.getTime()) {
        
        this.streak.lastCheckedDate = today;
        this.streak.freezeUsed = false; // Reset freeze usage for new day
        
        // Check if streak should be broken (user didn't solve yesterday)
        if (this.streak.lastSolvedDate) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const lastSolved = new Date(this.streak.lastSolvedDate);
            const lastSolvedDay = new Date(lastSolved.getFullYear(), lastSolved.getMonth(), lastSolved.getDate());
            
            // If last solved was before yesterday, streak is broken
            if (lastSolvedDay.getTime() < yesterday.getTime()) {
                // Check if user has freezes available
                if (this.streak.streakFreezes > 0 && !this.streak.freezeUsed) {
                    // Auto-use freeze to maintain streak
                    this.streak.streakFreezes -= 1;
                    this.streak.freezeUsed = true;
                } else {
                    // Streak is broken
                    this.streak.currentStreak = 0;
                }
            }
        }
        
        return true; // Reset was performed
    }
    
    return false; // No reset needed
};

module.exports = mongoose.model("User", UserSchema);
