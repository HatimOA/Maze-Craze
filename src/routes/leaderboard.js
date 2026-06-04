const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// =========================
// GET TOP 5 PLAYERS
// =========================
router.get("/", async (req, res, next) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        successful_attempts: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        successful_attempts: true,
      },
    });

    const leaderboard = players.map((player, index) => {
      const rank = index + 1;

      let title = "Top Player";
      let medal = "🎖️";

      if (rank === 1) {
        title = "Gold Player";
        medal = "🥇";
      } else if (rank === 2) {
        title = "Silver Player";
        medal = "🥈";
      } else if (rank === 3) {
        title = "Bronze Player";
        medal = "🥉";
      }

      return {
        rank,
        title,
        medal,
        player_id: player.id,
        player_name: player.name,
        successful_attempts: player.successful_attempts,
      };
    });

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

// =========================
// INCREMENT SUCCESSFUL ATTEMPTS
// =========================
router.post("/success", async (req, res, next) => {
  try {
    const { player_id } = req.body;

    if (!player_id) {
      return res.status(400).json({
        success: false,
        error: "player_id is required",
      });
    }

    const player = await prisma.player.update({
      where: {
        id: Number(player_id),
      },
      data: {
        successful_attempts: {
          increment: 1,
        },
      },
      select: {
        id: true,
        name: true,
        successful_attempts: true,
      },
    });

    res.json({
      success: true,
      message: "Successful attempt recorded",
      player,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;