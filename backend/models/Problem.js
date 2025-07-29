const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    testCases: [{ input: String, output: String, explanation: String }],
    languages: [String], // e.g., ["Python", "JavaScript", "C++"]
    topics: [String], // e.g., ["Array", "Breadth-First Search", "Dynamic Programming"]
    totalParticipants: { type: Number, default: 0 },
    statistics: {
        totalSubmissions: { type: Number, default: 0 },
        successfulSubmissions: { type: Number, default: 0 },
        totalParticipants: { type: Number, default: 0 }
    },
    attemptedUsers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
    solvedUsers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
});

ProblemSchema.virtual('timeLimit').get(function() {
    switch (this.difficulty) {
        case 'Easy': return 30;
        case 'Medium': return 90;
        case 'Hard': return 180;
        default: return null;
    }
});

ProblemSchema.virtual('successRate').get(function() {
    const attempted = Array.isArray(this.attemptedUsers) ? this.attemptedUsers.length : 0;
    const solved = Array.isArray(this.solvedUsers) ? this.solvedUsers.length : 0;
    if (attempted === 0) return 0;
    return Math.round((solved / attempted) * 100);
});

ProblemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Problem", ProblemSchema);
