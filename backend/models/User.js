const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    department: String,
    state: String,
    country: String,
    password: String,
    points: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

module.exports = mongoose.model("User", UserSchema);
