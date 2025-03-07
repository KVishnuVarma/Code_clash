const Submission = require('../models/Submission');

exports.getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find();
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to fetch submissions' });
    }
};

exports.getSubmissionsByUserId = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId });
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to fetch user submissions' });
    }
};

exports.getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.status(200).json(submission);
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to fetch submission' });
    }
};

exports.createSubmission = async (req, res) => {
    try {
        const submission = new Submission(req.body);
        await submission.save();
        res.status(201).json({ message: '✅ Submission created successfully', submission });
    } catch (err) {
        res.status(500).json({ error: '❌ Failed to create submission' });
    }
};
