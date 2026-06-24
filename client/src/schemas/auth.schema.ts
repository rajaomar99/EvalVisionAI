import { z } from "zod";

// Login
export const LoginSchema = z.object({
  email:    z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

// Register
export const RegisterSchema = z
  .object({
    name:            z.string().min(1, "Name is required").trim(),
    email:           z.email("Please enter a valid email address"),
    password:        z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must include at least one symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"], // attach the error to the confirmPassword field
  });

export type RegisterFormValues = z.infer<typeof RegisterSchema>;
