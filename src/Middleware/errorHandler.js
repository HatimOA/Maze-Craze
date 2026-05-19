const { ZodError } = require("zod");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { AppError } = require("../lib/errors");

function errorHandler(err, req, res, next) {
  console.error(err);

  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors,
    });
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON in request body",
    });
  }

  // Multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // JWT
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }

  // Prisma known errors → prevent 500 leaks
  if (err?.code === "P2002") {
    return res.status(409).json({
      message: "Duplicate entry",
    });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({
      message: "Not found",
    });
  }

  // custom errors
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = errorHandler;