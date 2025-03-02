const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const { getUserInfo, DiceRoll, verifyFiarNess } = require("../controllers/gameController");
const { Signup, Login, logout } = require("../controllers/authController");
const authenticateUser = require("../authMiddleware");



// User Signup
router.post("/signup", Signup);

// User Login
router.post("/login", Login);

// User Logout
router.post("/logout", logout);

// Get User Info
router.get("/user", getUserInfo);

//roll dice
router.post("/roll-dice", authenticateUser, DiceRoll);

// Verify Fairness
router.post("/verify-fairness", verifyFiarNess);


module.exports = router;
