const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// -------------------------
// AUTH SAFETY (IMPORTANT)
// -------------------------
function requireAuth(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// =========================
// GET /:state_id
// =========================
router.get("/:state_id", async (req, res) => {
  try {
    const { state_id } = req.params;

    const state = await prisma.state.findFirst({
      where: { state_id },
    });

    if (!state) {
      return res.status(404).json({
        message: "state not found", // lowercase FIXED
      });
    }

    return res.status(200).json(state);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================
// POST / (CREATE STATE)
// =========================
router.post("/", requireAuth, async (req, res) => {
  try {
    const { state_id, action, reward } = req.body;

    // boundary: reject invalid long IDs (fix 500 crash)
    if (typeof state_id !== "string") {
      return res.status(400).json({ message: "Invalid state_id" });
    }

    if (state_id.length > 255) {
      return res.status(400).json({ message: "state_id too long" });
    }

    const created = await prisma.state.create({
      data: {
        state_id,
        action,
        reward,
        player_id: req.user.id,
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================
// PUT /:state_id
// =========================
router.put("/:state_id", requireAuth, async (req, res) => {
  try {
    const { state_id } = req.params;

    const existing = await prisma.state.findFirst({
      where: { state_id },
    });

    if (!existing) {
      return res.status(404).json({ message: "state not found" });
    }

    if (existing.player_id !== req.user.id) {
      return res.status(403).json({ message: "forbidden" });
    }

    const updated = await prisma.state.update({
      where: { id: existing.id },
      data: req.body,
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================
// DELETE /:state_id
// =========================
router.delete("/:state_id", requireAuth, async (req, res) => {
  try {
    const { state_id } = req.params;

    const existing = await prisma.state.findFirst({
      where: { state_id },
    });

    if (!existing) {
      return res.status(404).json({ message: "state not found" });
    }

    if (existing.player_id !== req.user.id) {
      return res.status(403).json({ message: "forbidden" });
    }

    await prisma.state.delete({
      where: { id: existing.id },
    });

    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================
// POST /:state_id/recomendedState
// =========================
router.post("/:state_id/recomendedState", requireAuth, async (req, res) => {
  try {
    const { state_id } = req.params;

    const state = await prisma.state.findFirst({
      where: { state_id },
    });

    if (!state) {
      return res.status(404).json({ message: "state not found" });
    }

    const existing = await prisma.recommendationState.findFirst({
      where: {
        state_id,
        player_id: req.user.id,
      },
    });

    if (existing) {
      return res.status(200).json({
        recomendedState: true,
        porcentage: 1,
      });
    }

    await prisma.recommendationState.create({
      data: {
        state_id,
        player_id: req.user.id,
        recomendedState: true,
        porcentage: 1,
      },
    });

    return res.status(201).json({
      recomendedState: true,
      porcentage: 1,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// =========================
// DELETE /:state_id/recomendedState
// =========================
router.delete("/:state_id/recomendedState", requireAuth, async (req, res) => {
  try {
    const { state_id } = req.params;

    const existing = await prisma.recommendationState.findFirst({
      where: {
        state_id,
        player_id: req.user.id,
      },
    });

    if (!existing) {
      return res.status(200).json({
        recomendedState: false,
        porcentage: 0,
      });
    }

    await prisma.recommendationState.delete({
      where: { id: existing.id },
    });

    return res.status(200).json({
      recomendedState: false,
      porcentage: 0,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;