const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
    title: String,
    description: String,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    testCases: [{ input: String, output: String }],
    languages: [String], // e.g., ["Python", "JavaScript", "C++"]
    totalParticipants: { type: Number, default: 0 }
});

module.exports = mongoose.model("Problem", ProblemSchema);
