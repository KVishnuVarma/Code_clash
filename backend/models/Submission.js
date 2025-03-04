const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true }, // Python, JavaScript, etc.
    code: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Wrong Answer'], default: 'Pending' },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
