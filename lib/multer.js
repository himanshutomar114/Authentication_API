import multer from "multer";

// Use memory storage so we can pass the buffer to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ storage });
