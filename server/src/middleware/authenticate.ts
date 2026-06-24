import type { Request, Response, NextFunction } from "express";

/**
 * Passport adds req.isAuthenticated() to every request.
 * Returns 401 if the session cookie is missing or expired.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) { next(); return; }
  res.status(401).json({ message: "Authentication required" });
}
