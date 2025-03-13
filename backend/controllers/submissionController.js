const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { executeCode } = require("../utils/codeExecution");

const submitCode = async (req, res) => {
    const { userId, problemId, language, code } = req.body;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        let isCorrect = true;

        for (let testCase of problem.testCases) {
            console.log(`Running test case with input:`, testCase.input);
            const result = await executeCode(language, code, testCase.input);
            console.log(`Execution result:`, result);

            if (!result || result.stdout === null) {
                console.log("Error: executeCode returned null");
                return res.status(500).json({ error: "Code execution failed" });
            }

            if (result.stdout.trim() !== testCase.output.trim()) {
                isCorrect = false;
                break;
            }
        }

        const submission = new Submission({
            userId,
            problemId,
            language,
            code,
            status: isCorrect ? "Accepted" : "Wrong Answer"
        });

        await submission.save();
        if (isCorrect) {
            await Problem.updateOne({ _id: problemId }, { $inc: { totalParticipants: 1 } });
        }

        res.json({ message: "Submission successful", status: submission.status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitCode };
