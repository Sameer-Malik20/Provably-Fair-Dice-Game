const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();


const Signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: "Username already exists" });
        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Signup successful! Please login." });
    } catch (error) {
        res.status(500).json({ message: "Error signing up", error });
    }
}

const JWT_SECRET = process.env.JWT_SECRET; // Change this in production!
const Login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "3d" });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 3 // 3 days
        });
        res.json({ token, username: user.username, balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, msg: "Logged out successfully" });
}

module.exports = { Signup, Login, logout };
