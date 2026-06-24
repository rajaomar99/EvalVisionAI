import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { env } from "./env.js";

// Serialize / Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as Express.User | null);
  } catch (err) {
    done(err);
  }
});

// Local Strategy (email + password)
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user || !user.password) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, user as Express.User);
    } catch (err) {
      return done(err as Error);
    }
  })
);

// Google Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL:  env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const emails = profile.emails;
          if (!emails || emails.length === 0) {
            return done(new Error("No email returned from Google"));
          }
          const email = emails[0].value;

          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user as Express.User);

          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user as Express.User);
          }

          user = await User.create({
            name:     profile.displayName,
            email,
            googleId: profile.id,
          });

          return done(null, user as Express.User);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.warn(
    "[Passport] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set - Google OAuth is disabled. " +
    "Add them to server/.env to enable Google login."
  );
}

export default passport;
