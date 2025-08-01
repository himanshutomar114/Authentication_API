import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { login, signup, logout, onboard, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../lib/multer.js";

const router = express.Router();

// ✅ Google OAuth Start
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth Callback
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });

  // Optional: Redirect to your frontend
  res.redirect("http://localhost:5173/certificate"); // Or send user + token in response
});

// Other routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/onboard",protectRoute, upload.single("profilePic"), onboard);

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
