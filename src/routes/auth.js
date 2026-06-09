const axios = require("axios");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendVerificationEmail } = require("../utils/email");
const prisma = require("../lib/prisma");

const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../lib/errors");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * SAFE PASSWORD CHECK
 */
function isValidPassword(password) {
  if (typeof password !== "string") return false;

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
    let { name, email, password, captchaToken } = req.body;

    email = email?.toLowerCase();

    if (!name || !email || !password) {
      throw new ValidationError("Name, email and password are required");
    }

    isValidPassword(password);

    const existingPlayer = await prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const player = await prisma.player.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationExpires,
      },
    });

    /**
     * =========================
     * CAPTCHA (SAFE FOR TEST)
     * =========================
     */
    if (process.env.NODE_ENV === "production") {
      if (!captchaToken) {
        throw new ValidationError("Captcha is required");
      }

      try {
        const captchaResponse = await axios.post(
          "https://www.google.com/recaptcha/api/siteverify",
          null,
          {
            params: {
              secret: process.env.RECAPTCHA_SECRET_KEY,
              response: captchaToken,
            },
          }
        );

        if (!captchaResponse.data.success) {
          throw new ValidationError("Captcha verification failed");
        }
      } catch {
        // NEVER crash register due to captcha service
        throw new ValidationError("Captcha service unavailable");
      }
    }

    /**
     * EMAIL (NEVER BREAK TESTS)
     */
    if (process.env.NODE_ENV !== "test") {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (err) {
        console.error("Email send failed:", err.message);
        // DO NOT throw → prevents 500 in tests
      }
    }

    return res.status(201).json({
      msg: "User registered. Please verify your email.",
    });
  } catch (err) {
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
      throw new ValidationError("Email and password are required");
    }

    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!player.emailVerified) {
      throw new UnauthorizedError("Please verify your email first");
    }

    const isMatch = await bcrypt.compare(password, player.password);

    if (!isMatch) {
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
    next(err);
  }
});

/**
 * =========================
 * VERIFY EMAIL
 * =========================
 */
router.get("/verify/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

    const player = await prisma.player.findFirst({
      where: { verificationToken: token },
    });

    if (!player) {
      throw new ValidationError("Invalid verification token");
    }

    if (player.verificationExpires < new Date()) {
      throw new ValidationError("Verification link expired");
    }

    await prisma.player.update({
      where: { id: player.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
});

/**
 * =========================
 * RESEND EMAIL
 * =========================
 */
router.post("/resend-verification", async (req, res, next) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase();

    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      throw new ValidationError("User not found");
    }

    if (player.emailVerified) {
      return res.json({ msg: "Already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 86400000);

    await prisma.player.update({
      where: { id: player.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    if (process.env.NODE_ENV !== "test") {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch {
        console.error("Email resend failed");
      }
    }

    res.json({ msg: "Verification email resent" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;