const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    userId: String,
    problemId: String,
    language: String,
    code: String,
    status: { type: String, enum: ["Accepted", "Wrong Answer", "Error"] },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
