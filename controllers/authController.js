import User from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv"; 
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";


dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateUserName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
}

// Signup
export async function signup(req, res) {
  const { email, password, fullName, userName } = req.body;

  try {
    if (!email || !password || !fullName || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }


    const newUser = await User.create({
      email,
      fullName,
      userName,
      password,
      profilePic: "",
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




// Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



// Logout
export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
}



// Onboard
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, location, userName, profilePic } = req.body;

    if (!fullName || !bio || !location || !location.lat || !location.lng || !profilePic) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
          !profilePic && "profilePic",
        ].filter(Boolean),
      });
    }
    

    if (userName) {
      const isTaken = await User.findOne({ userName, _id: { $ne: userId } });
      if (isTaken) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          fullName,
          bio,
          location,
          userName,
          profilePic,
          isOnboarded: true,
        },
        { new: true }
      );
      

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}



// Google OAuth
export async function googleLogin(req, res) {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      let userName = generateUserName(name);
      while (await User.findOne({ userName })) {
        userName = generateUserName(name);
      }

      user = await User.create({
        email,
        fullName: name,
        userName,
        googleId,
        profilePic: picture,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", jwtToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Google login failed" });
  }
}

// Forgot Password-sends the mail with link to reset password
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Reset your password",
    html: `<a href="${resetLink}">Click here to reset your password</a>`,
  });

  res.json({ message: "Reset link sent to email" });
}

// Reset Password-after clicking the link and changing the password it changes in the database
export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
}