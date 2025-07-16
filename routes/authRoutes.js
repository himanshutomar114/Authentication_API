import express, { Router } from "express";
import { login, signup, logout , onboard , googleLogin , forgotPassword , resetPassword} from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup" , signup);

router.post("/login" , login);

router.post("/logout" , logout);

router.post("/google-login", googleLogin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/onboard" , protectRoute , onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;