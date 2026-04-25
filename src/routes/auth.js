const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// =========================
// REGISTER
// =========================
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password are required",
      });
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const player = await prisma.player.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { player_id: player.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      msg: "User registered",
      token,
      player: {
        id: player.id,
        email: player.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password required",
      });
    }

    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, player.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { player_id: player.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      player: {
        id: player.id,
        email: player.email, // ✅ fixed
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;