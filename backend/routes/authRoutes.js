const express = require("express");
const { registerUser,loginUser,getMyProfile,forgotPassword,resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMyProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword)

module.exports = router;