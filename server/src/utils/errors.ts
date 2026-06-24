// Base
export class AppError extends Error {
  statusCode?: number;
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

// HTTP error subclasses
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
