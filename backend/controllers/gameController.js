const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const getUserInfo = async (req, res) => {
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
}

const DiceRoll = async (req, res) => {
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
}


const verifyFiarNess = (req, res) => {
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
}
module.exports = { getUserInfo, DiceRoll, verifyFiarNess }