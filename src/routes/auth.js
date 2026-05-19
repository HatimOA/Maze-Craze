const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const prisma = require("../lib/prisma");

const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../lib/errors");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * SAFE PASSWORD CHECK (fix bcrypt 72-byte edge case tests)
 */
function isValidPassword(password) {
  if (typeof password !== "string") return false;

  // bcrypt hard limit safety (important for your tests)
  const byteLength = Buffer.byteLength(password, "utf8");
  if (byteLength > 72) {
    throw new ValidationError("Password too long");
  }

  return true;
}

/**
 * =========================
 * REGISTER
 * =========================
 */
router.post("/register", async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    email = email?.toLowerCase();

    if (!name || !email || !password) {
      req.log?.warn({ body: req.body }, "Registration validation failed");
      throw new ValidationError("Name, email and password are required");
    }

    isValidPassword(password);

    const existingPlayer = await prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      req.log?.warn({ email }, "Registration attempted with existing email");
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const player = await prisma.player.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      {
        player_id: player.id,
        name: player.name,
        email: player.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    req.log?.info(
      { player_id: player.id, email: player.email },
      "Player registered successfully"
    );

    res.status(201).json({
      msg: "User registered",
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
      },
    });
  } catch (err) {
    req.log?.error({ err }, "Registration failed");
    next(err);
  }
});

/**
 * =========================
 * LOGIN
 * =========================
 */
router.post("/login", async (req, res, next) => {
  try {
    let { email, password } = req.body;

    email = email?.toLowerCase();

    if (!email || !password) {
      req.log?.warn({ email }, "Login validation failed");
      throw new ValidationError("Email and password are required");
    }

    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      req.log?.warn({ email }, "Login attempted with nonexistent email");
      throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, player.password);

    if (!isMatch) {
      req.log?.warn(
        { player_id: player.id, email },
        "Invalid password attempt"
      );
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = jwt.sign(
      {
        player_id: player.id,
        name: player.name,
        email: player.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    req.log?.info(
      { player_id: player.id, email: player.email },
      "Player logged in successfully"
    );

    res.json({
      msg: "Login successful",
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
      },
    });
  } catch (err) {
    req.log?.error({ err }, "Login failed");
    next(err);
  }
});

module.exports = router;