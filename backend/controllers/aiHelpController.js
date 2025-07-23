const Submission = require("../models/Submission");
const User = require("../models/User");
const Problem = require("../models/Problem");

// Helper: Find a correct (Accepted) code for a problem
async function getAcceptedCode(problemId) {
  const accepted = await Submission.findOne({ problemId, status: "Accepted" }).sort({ submittedAt: 1 });
  return accepted ? accepted.code : null;
}

// Helper: Find common mistakes for a problem
async function getCommonMistakes(problemId) {
  const wrongSubs = await Submission.find({ problemId, status: { $ne: "Accepted" } }).lean();
  const errorMap = {};
  for (const sub of wrongSubs) {
    if (!sub.testResults) continue;
    for (const test of sub.testResults) {
      if (!test.passed && test.error) {
        errorMap[test.error] = (errorMap[test.error] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(errorMap).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? { error: sorted[0][0], count: sorted[0][1] } : null;
}

// POST /api/aihelp/error-fix
exports.errorFix = async (req, res) => {
  console.log("[AIHELP] /error-fix called with:", req.body);
  const { userId, problemId, code, language } = req.body;
  try {
    let mistake = null;
    let lastWrong = null;
    if (userId && problemId) {
      lastWrong = await Submission.findOne({ userId, problemId, status: { $ne: "Accepted" } }).sort({ submittedAt: -1 });
    }
    console.log("[AIHELP] lastWrong:", lastWrong);

    if (lastWrong && lastWrong.testResults && lastWrong.testResults.length > 0) {
      for (const test of lastWrong.testResults) {
        if (!test.passed) {
          mistake = {
            input: test.input,
            expected: test.expectedOutput,
            actual: test.actualOutput,
            error: test.error || null,
          };
          break;
        }
      }
    }

    if (!mistake) {
      const common = await getCommonMistakes(problemId);
      console.log("[AIHELP] common mistake:", common);
      if (common) {
        mistake = { input: null, expected: null, actual: null, error: common.error };
      }
    }

    let prompt = "Check your logic and syntax near the error shown.";
    if (mistake && mistake.error) {
      if (mistake.error.toLowerCase().includes("index")) prompt = "Check your array indices and bounds.";
      if (mistake.error.toLowerCase().includes("type")) prompt = "Check your variable types and conversions.";
      if (mistake.error.toLowerCase().includes("syntax")) prompt = "Check for missing brackets, colons, or semicolons.";
    }

    const correctCode = await getAcceptedCode(problemId);

    // Robust user feedback
    if (!lastWrong) {
      return res.json({
        mistake: null,
        prompt: "No previous submissions found for you. Try submitting your code first.",
        correctCode: correctCode || "No accepted solution found for this problem yet."
      });
    }
    if (!mistake) {
      return res.json({
        mistake: null,
        prompt: "No common mistakes found. Try submitting your code to see feedback.",
        correctCode: correctCode || "No accepted solution found for this problem yet."
      });
    }
    res.json({
      mistake,
      prompt,
      correctCode: correctCode || "No accepted solution found for this problem yet."
    });
  } catch (err) {
    console.error("[AIHELP] /error-fix error:", err);
    res.status(500).json({ error: "AI Help error-fix failed", details: err.message });
  }
};

// POST /api/aihelp/review
exports.review = async (req, res) => {
  console.log("[AIHELP] /review called with:", req.body);
  const { userId, problemId, code, language } = req.body;
  try {
    let lastSub = null;
    if (userId && problemId) {
      lastSub = await Submission.findOne({ userId, problemId }).sort({ submittedAt: -1 });
    }
    console.log("[AIHELP] lastSub:", lastSub);

    let review = null;
    if (lastSub && lastSub.testResults && lastSub.testResults.length > 0) {
      let passed = 0;
      let failed = 0;
      for (const test of lastSub.testResults) {
        if (test.passed) passed++;
        else failed++;
      }
      review = {
        total: lastSub.testResults.length,
        passed,
        failed,
        lastFailed: lastSub.testResults.find((t) => !t.passed) || null,
      };
    }

    let prompt = "Try to handle all edge cases and check your output format.";
    if (review && review.failed > 0 && review.lastFailed && review.lastFailed.error) {
      if (review.lastFailed.error.toLowerCase().includes("timeout")) prompt = "Optimize your code for performance.";
      if (review.lastFailed.error.toLowerCase().includes("output")) prompt = "Check your output format and whitespace.";
    }

    const correctCode = await getAcceptedCode(problemId);

    // Robust user feedback
    if (!lastSub) {
      return res.json({
        review: null,
        prompt: "No previous submissions found for you. Try submitting your code first.",
        correctCode: correctCode || "No accepted solution found for this problem yet."
      });
    }
    if (!review) {
      return res.json({
        review: null,
        prompt: "No test results found. Try submitting your code to see feedback.",
        correctCode: correctCode || "No accepted solution found for this problem yet."
      });
    }
    res.json({
      review,
      prompt,
      correctCode: correctCode || "No accepted solution found for this problem yet."
    });
  } catch (err) {
    console.error("[AIHELP] /review error:", err);
    res.status(500).json({ error: "AI Help review failed", details: err.message });
  }
};

// POST /api/aihelp/discussion
exports.discussion = async (req, res) => {
  console.log("[AIHELP] /discussion called with:", req.body);
  const { userId } = req.body;
  try {
    let name = "there";
    if (userId) {
      const user = await User.findById(userId);
      console.log("[AIHELP] discussion user:", user);
      if (user && user.name) name = user.name;
    }
    const message = `Hi ${name}, welcome to Code Clash! How can I assist you today?`;
    console.log("[AIHELP] Responding with message:", message);
    res.json({
      message,
    });
  } catch (err) {
    console.error("[AIHELP] /discussion error:", err);
    res.status(500).json({ error: "AI Help discussion failed", details: err.message });
  }
}; 