import { Request, Response } from "express";
import User from "../models/User.js";
import { handleError } from "../utils/handleError.js";
import { ValidationError, ConflictError } from "../utils/errors.js";

// Validators

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpper  = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return minLength && hasUpper && hasSymbol;
};

// Controllers

// register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as Record<string, any>;

    if (!name || !email || !password) {
      throw new ValidationError("Please fill in all fields.");
    }
    if (!isValidEmail(email)) {
      throw new ValidationError("Please enter a valid email address.");
    }
    if (!isValidPassword(password)) {
      throw new ValidationError(
        "Password must be at least 8 characters long, and include at least one uppercase letter and one symbol."
      );
    }

    const existing = await User.findOne({ email });
    if (existing) throw new ConflictError("Email already registered");

    const user = await User.create({ name, email, password });

    req.login(user as unknown as Express.User, (err) => {
      if (err) return handleError(err, res, "register");
      return res.status(201).json({ user: user.toSafeObject() });
    });
  } catch (err) {
    return handleError(err, res, "register");
  }
};

// login
export const login = (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user?.toSafeObject() });
};

// logout
export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return handleError(err, res, "logout");

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

// getMe
export const getMe = (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  return res.status(200).json({ user: req.user.toSafeObject() });
};
