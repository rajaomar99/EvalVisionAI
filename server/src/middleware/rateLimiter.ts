import rateLimit from "express-rate-limit";

// Global limiter: Generous limit for general API usage
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});

// Auth limiter: Strict limit to prevent brute force and credential stuffing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts from this IP, please try again after 15 minutes" },
});

// AI limiter: Moderate limit to prevent abuse of expensive API calls
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "You have exceeded the AI grading limit (20 per hour). Please try again later." },
});
