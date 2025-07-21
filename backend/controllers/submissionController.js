const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { executeCode } = require("../utils/codeExecution");

const submitCode = async (req, res) => {
  const { userId, problemId, language, code, violations } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const startTime = new Date();
    const testResults = [];
    let passedTests = 0;

    // Execute each test case and collect detailed results
    for (let testCase of problem.testCases) {
      let inputToUse = testCase.input;
      if (language.toLowerCase() === 'python' && /^s\s*=\s*/.test(inputToUse)) {
        inputToUse = inputToUse.replace(/^s\s*=\s*/, '').trim();
      }
      // Add debug logging
      console.log('--- Test Case Debug ---');
      console.log('Raw Input:', testCase.input);
      console.log('Processed Input:', inputToUse);
      console.log('Expected Output:', testCase.output);
      const result = await executeCode(language, code, inputToUse);
      console.log('User Output:', result.stdout);
      console.log('----------------------');

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
    const executionTime = endTime - startTime;

    // Create submission with detailed information
    const submission = new Submission({
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
        score: passedTests * 10, // 10 points per passed test
      },
      submittedAt: startTime,
    });

    await submission.save();

    // Update problem statistics
    await Problem.findByIdAndUpdate(problemId, {
      $inc: {
        "statistics.totalSubmissions": 1,
        "statistics.successfulSubmissions":
          passedTests === problem.testCases.length ? 1 : 0,
        "statistics.totalParticipants":
          passedTests === problem.testCases.length ? 1 : 0,
      },
    });

    // Send detailed response
    res.json({
      success: true,
      submissionId: submission._id,
      results: {
        testCases: testResults.map((test) => ({
          input: test.input,
          output: test.actualOutput,
          passed: test.passed,
        })),
        metrics: submission.metrics,
        violations: submission.violations,
        startTime: startTime.toISOString(),
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
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
        score: sub.metrics.score,
        passedTests: sub.metrics.passedTests,
        totalTests: sub.metrics.totalTests,
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

module.exports = {
  submitCode,
  getSubmissionHistory,
  getSubmissionDetails,
};
