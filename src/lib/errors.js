class AppError extends Error {

  constructor(
    message = "Server error",
    status = 500
  ) {

    super(message);

    this.name =
      this.constructor.name;

    this.status = status;

    // operational error
    this.isOperational = true;

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

class ValidationError extends AppError {

  constructor(
    message = "Invalid input"
  ) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {

  constructor(
    message = "Unauthorized"
  ) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {

  constructor(
    message = "Forbidden"
  ) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {

  constructor(
    message = "Not found"
  ) {
    super(message, 404);
  }
}

class ConflictError extends AppError {

  constructor(
    message = "Conflict"
  ) {
    super(message, 409);
  }
}

module.exports = {
  AppError,

  ValidationError,
  UnauthorizedError,
  ForbiddenError,

  NotFoundError,
  ConflictError,
};
