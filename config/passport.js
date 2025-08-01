import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;

      try {
        const email = emails[0].value;

        // 🔍 First, find user by email
        let user = await User.findOne({ email });

        if (user) {
          // 👇 Link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = id;
            await user.save();
          }

          return done(null, user);
        }

        // 🆕 Create new user if email doesn't exist
        let userName = displayName.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
        while (await User.findOne({ userName })) {
          userName = displayName.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
        }

        const newUser = await User.create({
          googleId: id,
          fullName: displayName,
          email,
          profilePic: photos[0].value,
          userName,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
