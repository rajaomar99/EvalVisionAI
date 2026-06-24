/**
 * Augments Express's global User interface so that req.user is fully typed
 * throughout the application without casting.
 *
 * Passport stores whatever you pass to `done(null, user)` on req.user.
 * We pass a Mongoose UserDocument, so we declare all its fields here.
 */
declare global {
  namespace Express {
    interface User {
      _id: import("mongoose").Types.ObjectId;
      id:  string;     // Mongoose virtual - same as _id.toString()
      name: string;
      email: string;
      password?: string;
      googleId?: string | null;
      createdAt: Date;
      updatedAt: Date;
      toSafeObject(): {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

// Need to make this a module (otherwise the `declare global` is file-scoped)
export {};
