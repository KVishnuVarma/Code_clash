const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, phone, department, state, country, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, department, state, country, password: hashedPassword });
    
    await newUser.save();
    res.json({ message: "User registered successfully" });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
    if (user.isSuspended) {
        return res.status(403).json({ message: "Your account is suspended. Please contact the administrator." });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });
};
