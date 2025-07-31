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
  const { userId, problemId, code, language } = req.body;
  try {
    let mistake = null;
    let lastWrong = null;
    if (userId && problemId) {
      lastWrong = await Submission.findOne({ userId, problemId, status: { $ne: "Accepted" } }).sort({ submittedAt: -1 });
    }

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
      if (common) {
        mistake = { input: null, expected: null, actual: null, error: common.error };
      }
    }

    // --- New: Always get correct code for the problem ---
    const correctCode = await getAcceptedCode(problemId);
    let prompt = "Check your logic and syntax near the error shown.";
    let userFriendlyError = null;

    // --- New: If there is a real error, provide a user-friendly explanation ---
    if (mistake && mistake.error) {
      const err = mistake.error.toLowerCase();
      if (err.includes("syntaxerror") || err.includes("invalid syntax")) {
        prompt = "You have a syntax error. Check for missing brackets, colons, or indentation issues.";
        userFriendlyError = "Syntax Error: Please check your code for missing or misplaced symbols (e.g., brackets, colons, indentation).";
      } else if (err.includes("index")) {
        prompt = "Check your array indices and bounds.";
        userFriendlyError = "Index Error: You may be accessing an array or string out of bounds.";
      } else if (err.includes("type")) {
        prompt = "Check your variable types and conversions.";
        userFriendlyError = "Type Error: There may be a mismatch in variable types or conversions.";
      } else if (err.includes("nameerror")) {
        prompt = "Check for typos or undefined variables.";
        userFriendlyError = "Name Error: You may be using a variable that is not defined or misspelled.";
      } else if (err.includes("timeout")) {
        prompt = "Optimize your code for performance.";
        userFriendlyError = "Timeout Error: Your code is taking too long to run. Try optimizing it.";
      }
    }

    // --- New: Always return a prompt and sample code, even if no user submission ---
    if (!lastWrong) {
      return res.json({
        mistake: null,
        prompt: "You haven't submitted code yet, but you can review the sample solution and explanation below to help you get started!",
        correctCode: correctCode || "No accepted solution found for this problem yet.",
        userFriendlyError: null
      });
    }
    if (!mistake) {
      return res.json({
        mistake: null,
        prompt: "No common mistakes found. Try submitting your code to see feedback.",
        correctCode: correctCode || "No accepted solution found for this problem yet.",
        userFriendlyError: null
      });
    }
    res.json({
      mistake,
      prompt,
      correctCode: correctCode || "No accepted solution found for this problem yet.",
      userFriendlyError: userFriendlyError || null
    });
  } catch (err) {
    res.status(500).json({ error: "AI Help error-fix failed", details: err.message });
  }
};

// POST /api/aihelp/review
exports.review = async (req, res) => {
  const { userId, problemId, code, language } = req.body;
  try {
    let lastSub = null;
    if (userId && problemId) {
      lastSub = await Submission.findOne({ userId, problemId }).sort({ submittedAt: -1 });
    }

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
    res.status(500).json({ error: "AI Help review failed", details: err.message });
  }
};

// POST /api/aihelp/discussion
exports.discussion = async (req, res) => {
  const { userId } = req.body;
  try {
    let name = "there";
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.name) name = user.name;
    }
    const message = `Hi ${name}, welcome to Code Clash! How can I assist you today?`;
    res.json({
      message,
    });
  } catch (err) {
    res.status(500).json({ error: "AI Help discussion failed", details: err.message });
  }
}; 