const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "ended"],
      default: "upcoming",
    },
    difficulty: { type: String },
    rules: { type: String },
    allowedLanguages: [{ type: String }],
    maxAttempts: { type: Number },
    totalParticipants: { type: Number, default: 0 },
    clearedParticipants: { type: Number, default: 0 },
    failedParticipants: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);