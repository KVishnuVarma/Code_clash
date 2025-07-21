const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    testCases: [{ input: String, output: String }],
    languages: [String], // e.g., ["Python", "JavaScript", "C++"]
    totalParticipants: { type: Number, default: 0 },
    statistics: {
        totalSubmissions: { type: Number, default: 0 },
        successfulSubmissions: { type: Number, default: 0 },
        totalParticipants: { type: Number, default: 0 }
    }
});

ProblemSchema.virtual('timeLimit').get(function() {
    switch (this.difficulty) {
        case 'Easy': return 30;
        case 'Medium': return 90;
        case 'Hard': return 180;
        default: return null;
    }
});

ProblemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Problem", ProblemSchema);
