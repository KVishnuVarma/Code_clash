const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    department: String,
    state: String,
    country: String,
    password: String,
    points: { type: Number, default: 0 },
    solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem', default: [] }],
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
    }]
});

module.exports = mongoose.model("User", UserSchema);
