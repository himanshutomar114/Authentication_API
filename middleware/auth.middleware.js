import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Try Authorization header first (Google OAuth flow)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ If no header token, try cookie (Manual login flow)
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // 3️⃣ No token found
    if (!token) {
      return res.status(401).json({ message: "Unauthorized – No token provided" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized – Invalid token" });
    }

    // 5️⃣ Find user in DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized – User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT protectRoute error:", error.message);
    return res.status(401).json({ message: "Unauthorized – Token error" });
  }
};
