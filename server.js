import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";


//for fetching data by the frontend or accepting the frontend requests
import cors from "cors";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow sending cookies
  })
);




app.get('/', (req, res) => {
    res.send('Backend is running ✅');
  });


  // ✅ API Routes
  app.use("/api/auth" , authRoutes);
  

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await  connectDB();
});
