const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    difficulty: { type: String },
    rules: { type: String },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    allowedLanguages: [{ type: String }],
    maxAttempts: { type: Number },
    problems: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOption: { type: Number, required: true }, // Index of the correct option
      },
    ],

    // These fields were misplaced, now correctly placed inside the schema
    totalParticipants: { type: Number, default: 0 },
    clearedParticipants: { type: Number, default: 0 },
    failedParticipants: { type: Number, default: 0 },
    users : [{
      userId : {
        ref : "User",
        type : mongoose.Schema.Types.ObjectId
      },
      default: [],
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);
