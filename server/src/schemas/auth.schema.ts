import { z } from "zod";

// Register
export const RegisterSchema = z.object({
  name:     z.string().min(1, "Name is required").trim(),
  email:    z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must include at least one symbol"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Login
export const LoginSchema = z.object({
  email:    z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
