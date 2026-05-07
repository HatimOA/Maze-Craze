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
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email and password are required",
      });
    }

    // check existing user
    const existingPlayer = await prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create player
    const player = await prisma.player.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // create token
    const token = jwt.sign(
      {
        player_id: player.id,
        name: player.name,
        email: player.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      msg: "User registered",
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password required",
      });
    }

    // find user
    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, player.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    // create token
    const token = jwt.sign(
      {
        player_id: player.id,
        name: player.name,
        email: player.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      msg: "Login successful",
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
