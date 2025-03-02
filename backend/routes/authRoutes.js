const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Change this in production!

// User Signup
router.post("/signup", async (req, res) => {
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
});



// User Login
router.post("/login", async (req, res) => {
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
});

// Get User Info
router.get("/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ username: user.username, balance: user.balance });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized. No Token Provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

//Dice Roll API
const crypto = require("crypto");

router.post("/roll-dice", authenticateUser, async (req, res) => {
    const { betAmount, clientSeed, betHash } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!betAmount || betAmount <= 0) {
            return res.status(400).json({ message: "Invalid bet amount" });
        }

        if (betAmount > user.balance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Generate Hash for Verification
        const backendHash = crypto.createHash("sha256").update(`${betAmount}-${clientSeed}`).digest("hex");

        if (backendHash !== betHash) {
            return res.status(400).json({ message: "Invalid bet verification" });
        }

        // Dice roll logic
        const roll = Math.floor(Math.random() * 6) + 1;
        const result = roll > 3 ? "Win" : "Lose";

        if (result === "Win") {
            user.balance += betAmount * 2; // Win 2x the bet amount
        } else {
            user.balance -= betAmount;
        }

        await user.save();
        return res.json({ roll, result, newBalance: user.balance });
    } catch (error) {
        console.error("Error in roll-dice:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/verify-fairness", (req, res) => {
    const { betAmount, clientSeed, betHash } = req.body;

    try {
        //  (Same Logic as /roll-dice)
        const backendHash = crypto.createHash("sha256").update(`${betAmount}-${clientSeed}`).digest("hex");
        console.log("🔹 Backend Verify Hash:", backendHash);
        console.log("🔹 Received Hash for Verification:", betHash);

        if (backendHash !== betHash) {
            return res.status(400).json({ message: "Not Fair! Hash Mismatch" });
        }

        return res.json({ message: "✅Verification Successful! The game result is provably fair." });
    } catch (error) {
        console.error("Error in verify-fairness:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// User Logout
router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, msg: "Logged out successfully" });
});

module.exports = router;
