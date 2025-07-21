const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"],
    required: true,
  },
  testResults: [
    {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
      executionTime: Number,
    },
  ],
  violations: {
    copyPaste: {
      type: Number,
      default: 0,
    },
    tabChanges: {
      type: Number,
      default: 0,
    },
    mobileDetected: {
      type: Boolean,
      default: false,
    },
    details: [
      {
        type: {
          type: String,
          enum: ["copy_paste", "tab_change", "mobile_detected"],
        },
        timestamp: Date,
        description: String,
      },
    ],
  },
  metrics: {
    totalTests: Number,
    passedTests: Number,
    executionTime: Number,
    score: Number,
    timeTaken: Number,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
submissionSchema.index({ userId: 1, problemId: 1, submittedAt: -1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
