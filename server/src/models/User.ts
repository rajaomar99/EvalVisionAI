import bcrypt from "bcryptjs";
import mongoose, { Schema, Model } from "mongoose";

// Interfaces
export interface IUser {
  name:      string;
  email:     string;
  password?: string;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id:        string;
  name:      string;
  email:     string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  toSafeObject(): SafeUser;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

// Schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name:     { type: String, required: [true, "Name is required"],  trim: true },
    email:    { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: [8, "Password must be at least 8 characters"], select: false },
    googleId: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
userSchema.methods.toSafeObject = function (): SafeUser {
  return {
    id:        this._id.toString(),
    name:      this.name,
    email:     this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);
export default User;
