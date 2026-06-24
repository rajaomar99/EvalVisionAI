import { Router } from "express";
import passport from "../config/passport.js";
import { authenticate } from "../middleware/authenticate.js";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { env } from "../config/env.js";

const router = Router();

router.post("/register", register);

router.post(
  "/login",
  passport.authenticate("local", {
    session: true,
    failWithError: true,   // surfaces errors as proper Express errors
  }),
  login
);

router.use("/login", (err: any, req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
  res.status(401).json({ message: err.message || "Invalid credentials" });
});

router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

// Google OAuth
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${env.CLIENT_ORIGIN}/login?error=google`,
    }),
    (req: import("express").Request, res: import("express").Response) => {
      res.redirect(`${env.CLIENT_ORIGIN}/dashboard`);
    }
  );
} else {
  const googleDisabled = (req: import("express").Request, res: import("express").Response) =>
    res.status(503).json({ message: "Google OAuth is not configured on this server." });

  router.get("/google", googleDisabled);
  router.get("/google/callback", googleDisabled);
}

export default router;
