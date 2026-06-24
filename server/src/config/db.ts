import mongoose from "mongoose";
import { env } from "./env.js";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('toJSON', {
      virtuals: true,
      transform: (doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
      }
    });

    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MongoDB connection error: ${message}`);
    process.exit(1);
  }
}
