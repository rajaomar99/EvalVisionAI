import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import { createRouteHandler } from "uploadthing/express";
import { env } from "./config/env.js";
import { uploadRouter } from "./config/uploadthing.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { Request, Response, NextFunction } from "express";

const app = express();

// Trust the proxy (e.g. Render, Heroku) so secure cookies can be set
app.set("trust proxy", 1);

// Core Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

// Session
app.use(
  session({
    secret:            env.SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    store:             MongoStore.create({ mongoUrl: env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      secure:   env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api/auth",        authRoutes);
app.use("/api/exams",       examRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/ai",          aiRoutes);

// UploadThing Route Handler
app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
