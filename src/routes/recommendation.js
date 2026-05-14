const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");

router.use(authenticate);

// helper: normalize id (VERY IMPORTANT for your 404 bugs)
const normalizeId = (id) => id?.toString();

// LIKE / RECOMMEND
router.post("/:state_id/recomendedState", async (req, res) => {
  try {
    const state_id = normalizeId(req.params.state_id);

    const state = await prisma.state.findUnique({
      where: { state_id },
    });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    const existing = await prisma.recommendedState.findFirst({
      where: {
        state_id,
        player_id: req.player.id,
      },
    });

    if (!existing) {
      await prisma.recommendedState.create({
        data: {
          state_id,
          player_id: req.player.id,
        },
      });
    }

    const count = await prisma.recommendedState.count({
      where: { state_id },
    });

    const totalPlayers = await prisma.player.count(); // adjust if needed

    return res.status(201).json({
      recomendedState: true,
      porcentage: totalPlayers ? count / totalPlayers : 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// UNLIKE
router.delete("/:state_id/recomendedState", async (req, res) => {
  try {
    const state_id = normalizeId(req.params.state_id);

    const state = await prisma.state.findUnique({
      where: { state_id },
    });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    await prisma.recommendedState.deleteMany({
      where: {
        state_id,
        player_id: req.player.id,
      },
    });

    const count = await prisma.recommendedState.count({
      where: { state_id },
    });

    const totalPlayers = await prisma.player.count();

    return res.status(200).json({
      recomendedState: false,
      porcentage: totalPlayers ? count / totalPlayers : 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;