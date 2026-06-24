import type { Response } from "express";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "./errors.js";

export function handleError(err: unknown, res: Response, context = ""): void {
  if (context) {
    console.error(`[${context}]`, err instanceof Error ? err.message : String(err));
  }

  if (err instanceof ValidationError)     { res.status(400).json({ message: err.message }); return; }
  if (err instanceof AuthenticationError) { res.status(401).json({ message: err.message }); return; }
  if (err instanceof ForbiddenError)      { res.status(403).json({ message: err.message }); return; }
  if (err instanceof NotFoundError)       { res.status(404).json({ message: err.message }); return; }
  if (err instanceof ConflictError)       { res.status(409).json({ message: err.message }); return; }

  // AppError subclass with an explicit statusCode (e.g. from AI service)
  if (err instanceof AppError && err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Plain Error objects that carry a statusCode (e.g. thrown by libraries)
  if (err instanceof Error) {
    const withStatus = err as Error & { statusCode?: number };
    if (withStatus.statusCode) {
      res.status(withStatus.statusCode).json({ message: err.message });
      return;
    }
  }

  res.status(500).json({ message: "Internal server error" });
}
