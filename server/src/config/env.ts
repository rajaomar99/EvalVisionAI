import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Schema
const EnvSchema = z.object({
  NODE_ENV:             z.string().default("development"),
  PORT:                 z.coerce.number().default(5000),
  MONGODB_URI:          z.string().min(1, "MONGODB_URI is required"),
  CLIENT_ORIGIN:        z.string().default("http://localhost:5173"),
  AI_SERVICE_URL:       z.string().default("http://localhost:8001"),
  AI_API_KEY:           z.string().default("evalvision_default_secret_key"),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .default("dev-secret-change-in-prod-32chars"),

  // Google OAuth
  GOOGLE_CLIENT_ID:     z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_CALLBACK_URL:  z.string().default("http://localhost:5000/api/auth/google/callback"),

  // UploadThing
  UPLOADTHING_TOKEN: z.string().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);
