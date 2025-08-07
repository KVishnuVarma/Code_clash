const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    rules: { type: String },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    prizes: {
      top3: { type: String, default: "CodeClash Backpack" },
      top10: { type: String, default: "CodeClash Water Bottle" },
      special: { type: String, default: "CodeClash Big O Notebook" },
      specialPositions: [{ type: Number }], // Array of special position ranks that get the notebook
    },
    allowedLanguages: [{ type: String }],
    maxAttempts: { type: Number },
    problems: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        points: { type: Number, default: 100 }
      },
    ],
    // For MCQ type questions if needed
    mcqProblems: [
      {
        question: { type: String },
        options: [{ type: String }],
        correctOption: { type: Number }, // Index of the correct option
        points: { type: Number, default: 10 }
      },
    ],
    totalParticipants: { type: Number, default: 0 },
    clearedParticipants: { type: Number, default: 0 },
    failedParticipants: { type: Number, default: 0 },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        rank: { type: Number },
        solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
        submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);
