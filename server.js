import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import passport from "passport";
import "./config/passport.js"; // 👈 Import your passport strategy configuration

dotenv.config();


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173"
      
      ],
    credentials: true, // allow frontend to send cookies
  })
);



app.use(passport.initialize());
// app.use(passport.session()); // Only if you're using session-based auth

// Routes
app.get('/', (req, res) => {
  res.send("Server is Live");
});




app.use("/api/auth", authRoutes);


//for location detection
app.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(550).json({ error: 'Failed to reverse geocode' });
  }
});

const PORT = process.env.PORT || 3000;
// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error("❌ Failed to start server due to DB error:", err);
});
