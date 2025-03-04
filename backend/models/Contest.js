const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }], // Array of problem IDs
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Contest', ContestSchema);
