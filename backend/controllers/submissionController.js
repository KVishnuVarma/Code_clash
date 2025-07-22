const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { executeCode } = require("../utils/codeExecution");
const User = require("../models/User");

const submitCode = async (req, res) => {
  const { userId, problemId, language, code, violations, mode, elapsedTime } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const startTime = new Date();
    const testResults = [];
    let passedTests = 0;

    // Determine which test cases to run
    let testCasesToRun = problem.testCases;
    if (mode === 'run') {
      testCasesToRun = problem.testCases.slice(0, 1); // Only first test case
    }

    // Execute each test case and collect detailed results
    for (let testCase of testCasesToRun) {
      let inputToUse = testCase.input;
      if (language.toLowerCase() === 'python' && /^s\s*=\s*/.test(inputToUse)) {
        inputToUse = inputToUse.replace(/^s\s*=\s*/, '').trim();
      }
      const result = await executeCode(language, code, inputToUse);
      if (!result || result.stdout === null) {
        return res.status(500).json({ error: "Code execution failed" });
      }
      const passed = result.stdout.trim() === testCase.output.trim();
      if (passed) passedTests++;
      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.stdout,
        passed,
        executionTime: result.executionTime || 0,
      });
    }

    const endTime = new Date();
    const executionTime = Math.floor((endTime - startTime) / 1000); // in seconds
    // Use elapsedTime from frontend if provided, else fallback to executionTime
    const timeTaken = typeof elapsedTime === 'number' ? elapsedTime : executionTime;

    // Only save submission for 'submit' mode
    let submission = null;
    if (mode === 'submit') {
      // Check if user already solved this problem
      const alreadySolved = await Submission.findOne({ userId, problemId, status: 'Accepted' });
      // Count previous attempts for this user/problem
      const previousAttempts = await Submission.countDocuments({ userId, problemId });
      // Penalty scoring: 30 for first, 20 for second, 10 for third+
      let score = 0;
      if (passedTests === problem.testCases.length) {
        if (previousAttempts === 0) score = 30;
        else if (previousAttempts === 1) score = 20;
        else score = 10;
      }
      submission = new Submission({
        userId,
        problemId,
        language,
        code,
        status:
          passedTests === problem.testCases.length ? "Accepted" : "Wrong Answer",
        testResults,
        violations: {
          copyPaste: violations?.copyPaste || 0,
          tabChanges: violations?.tabChanges || 0,
          mobileDetected: violations?.mobileDetected || false,
          details:
            violations?.details?.map((v) => ({
              type: v.type,
              timestamp: new Date(v.timestamp),
              description: v.description,
            })) || [],
        },
        metrics: {
          totalTests: problem.testCases.length,
          passedTests,
          executionTime,
          score,
          timeTaken, // Always set timeTaken
        },
        submittedAt: startTime,
      });
      await submission.save();

      // Update attemptedUsers and solvedUsers arrays
      await Problem.findByIdAndUpdate(problemId, {
        $addToSet: { attemptedUsers: userId },
      });
      if (passedTests === problem.testCases.length) {
        await Problem.findByIdAndUpdate(problemId, {
          $addToSet: { solvedUsers: userId },
        });
      }

      // Only update stats and points if user hasn't solved before and this is an accepted solution
      if (!alreadySolved && passedTests === problem.testCases.length) {
        await Problem.findByIdAndUpdate(problemId, {
          $inc: {
            "statistics.totalSubmissions": 1,
            "statistics.successfulSubmissions": 1,
            "statistics.totalParticipants": 1,
          },
        });
        // Update user points and solvedProblems
        await User.findByIdAndUpdate(userId, {
          $inc: { points: score },
          $addToSet: { solvedProblems: problemId },
        });
      } else {
        // Only increment totalSubmissions if not a new solve
        await Problem.findByIdAndUpdate(problemId, {
          $inc: {
            "statistics.totalSubmissions": 1,
          },
        });
      }
      // Update user's problemScores array
      const user = await User.findById(userId);
      if (user) {
        const existingScore = user.problemScores.find(
          (ps) => ps.problemId.toString() === problemId.toString()
        );
        if (!existingScore && passedTests === problem.testCases.length) {
          user.problemScores.push({
            problemId,
            score,
            timeTaken,
            attempts: previousAttempts + 1,
          });
        } else if (existingScore && passedTests === problem.testCases.length) {
          // Only update if this attempt is better (higher score or less time)
          if (score > existingScore.score || (score === existingScore.score && timeTaken < existingScore.timeTaken)) {
            existingScore.score = score;
            existingScore.timeTaken = timeTaken;
            existingScore.attempts = previousAttempts + 1;
          }
        } else if (existingScore) {
          // If not accepted, just update attempts
          existingScore.attempts = previousAttempts + 1;
        }
        await user.save();
      }
    }

    // Send detailed response
    res.json({
      success: true,
      submissionId: submission ? submission._id : null,
      results: {
        testCases: testResults.map((test) => ({
          input: test.input,
          output: test.actualOutput,
          passed: test.passed,
        })),
        metrics: {
          totalTests: testCasesToRun.length,
          passedTests,
          executionTime,
          score: submission ? submission.metrics.score : 0,
          timeTaken,
        },
        violations: violations,
        startTime: startTime.toISOString(),
        timeTaken,
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
    console.error("Submission error stack:", error.stack);
    console.error("Submission request body:", req.body);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionHistory = async (req, res) => {
  const { userId, problemId, limit = 10 } = req.query;

  try {
    const query = { userId };
    if (problemId) query.problemId = problemId;

    const submissions = await Submission.find(query)
      .select("-code") // Exclude code for performance
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      submissions: submissions.map((sub) => ({
        ...sub,
        problemId: String(sub.problemId),
        score: sub.metrics.score,
        passedTests: sub.metrics.passedTests,
        totalTests: sub.metrics.totalTests,
        timeTaken: sub.metrics.timeTaken || sub.metrics.executionTime || null,
        submittedAt: sub.submittedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching submission history:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionDetails = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId)
      .populate("problemId", "title difficulty category")
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({
      success: true,
      submission: {
        ...submission,
        submittedAt: submission.submittedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching submission details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users who have submitted to a specific problem
const getProblemParticipants = async (req, res) => {
  const { problemId } = req.params;
  try {
    // Find all submissions for the problem
    const submissions = await Submission.find({ problemId })
      .populate('userId', 'name email points')
      .lean();
    if (!submissions.length) {
      return res.json({ participants: [] });
    }
    // Map userId to best submission (highest score, then fastest time)
    const userMap = {};
    for (const sub of submissions) {
      const uid = String(sub.userId._id);
      if (!userMap[uid]) {
        userMap[uid] = { user: sub.userId, submission: sub };
      } else {
        const prev = userMap[uid].submission;
        // Prefer higher score, then faster time
        if (
          sub.metrics.score > prev.metrics.score ||
          (sub.metrics.score === prev.metrics.score && (sub.metrics.timeTaken || 99999) < (prev.metrics.timeTaken || 99999))
        ) {
          userMap[uid] = { user: sub.userId, submission: sub };
        }
      }
    }
    const participants = Object.values(userMap).map(({ user, submission }) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      points: user.points,
      score: submission.metrics.score,
      timeTaken: submission.metrics.timeTaken,
      status: submission.status,
      submittedAt: submission.submittedAt,
    }));
    res.json({ participants });
  } catch (error) {
    console.error('Error fetching problem participants:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitCode,
  getSubmissionHistory,
  getSubmissionDetails,
  getProblemParticipants,
};
