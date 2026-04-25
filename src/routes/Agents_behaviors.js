const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");

// Apply authentication to ALL routes in this router
router.use(authenticate);

// -------------------------
// Allowed filter fields
// -------------------------
const allowedFields = [
  "state_id",
  "p1_x",
  "p1_y",
  "p2_x",
  "p2_y",
  "r_x",
  "r_y",
  "robbers_left",
  "player_id",
];

// -------------------------
// GET - Get all states (with relations)
// -------------------------
router.get("/", async (req, res) => {
  try {
    const filters = {};

    for (const key of Object.keys(req.query)) {
      const value = req.query[key];

      if (!allowedFields.includes(key)) continue;

      if (!isNaN(value)) {
        filters[key] = Number(value);
      } else {
        filters[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }

    const states = await prisma.state.findMany({
      where: filters,
      orderBy: { state_id: "asc" },
      include: {
        player: true,
        rewards: {
          include: {
            action: true,
          },
        },
      },
    });

    if (states.length === 0) {
      return res.status(404).json({ msg: "Agent state not found" });
    }

    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// GET - Single state
// -------------------------
router.get("/:state_id", async (req, res) => {
  try {
    const { state_id } = req.params;

    const state = await prisma.state.findUnique({
      where: { state_id },
      include: {
        player: true,
        rewards: {
          include: { action: true },
        },
      },
    });

    if (!state) {
      return res.status(404).json({ msg: "State not found" });
    }

    res.json(state);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// POST - Create state + reward
// -------------------------
router.post("/create", async (req, res) => {
  try {
    const {
      state_id,
      player_id,
      p1_x, p1_y,
      p2_x, p2_y,
      r_x, r_y,
      robbers_left,
      action_id,
      reward_value,
    } = req.body;

    if (
      !state_id ||
      !player_id ||
      action_id === undefined ||
      reward_value === undefined
    ) {
      return res.status(400).json({
        msg: "Missing required fields",
      });
    }

    const newState = await prisma.state.create({
      data: {
        state_id,
        p1_x,
        p1_y,
        p2_x,
        p2_y,
        r_x,
        r_y,
        robbers_left,

        // connect player
        player: {
          connect: { id: player_id },
        },

        // create reward + connect action
        rewards: {
          create: {
            value: Number(reward_value),
            action: {
              connect: { action_id },
            },
          },
        },
      },
      include: {
        rewards: {
          include: { action: true },
        },
      },
    });

    res.status(201).json(newState);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// POST - Add reward to existing state
// -------------------------
router.post("/:state_id/reward", async (req, res) => {
  try {
    const { state_id } = req.params;
    const { action_id, value } = req.body;

    const reward = await prisma.reward.create({
      data: {
        value: Number(value),
        state: {
          connect: { state_id },
        },
        action: {
          connect: { action_id },
        },
      },
    });

    res.status(201).json(reward);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// PUT - Update reward
// -------------------------
router.put("/reward/update", async (req, res) => {
  try {
    const { state_id, action_id, value } = req.body;

    const updatedReward = await prisma.reward.update({
      where: {
        state_id_action_id: {
          state_id,
          action_id,
        },
      },
      data: {
        value: Number(value),
      },
    });

    res.json({
      msg: "Reward updated successfully",
      data: updatedReward,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// PUT - Update state info only
// -------------------------
router.put("/update/:state_id",isOwner, async (req, res) => {
  try {
    const { state_id } = req.params;
    const data = req.body;

    const existingState = await prisma.state.findUnique({
      where: { state_id },
    });

    if (!existingState) {
      return res.status(404).json({ msg: "State not found" });
    }

    const updatedState = await prisma.state.update({
      where: { state_id },
      data,
    });

    res.json({
      msg: "State updated successfully",
      data: updatedState,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// -------------------------
// DELETE state (safe)
// -------------------------
router.delete("/delete/:state_id",isOwner, async (req, res) => {
  try {
    const { state_id } = req.params;

    await prisma.reward.deleteMany({
      where: { state_id },
    });

    const deletedState = await prisma.state.delete({
      where: { state_id },
    });

    res.json({
      msg: "State deleted successfully",
      state: deletedState,
    });
  } catch (err) {
    res.status(404).json({ msg: "State not found" });
  }
});

// -------------------------
// GET - states with reward = 0
// -------------------------
router.get("/with-reward-zero", async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      where: {
        rewards: {
          some: {
            value: 0,
          },
        },
      },
      include: {
        rewards: {
          include: { action: true },
        },
      },
    });

    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;