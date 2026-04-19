const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");


// Allowed filter fields (IMPORTANT: prevents Prisma errors)
const allowedFields = [
  "state_id",
  "p1_x",
  "p1_y",
  "p2_x",
  "p2_y",
  "r_x",
  "r_y",
  "robbers_left",
];


// GET (filter states safely)
router.get("/", async (req, res) => {
  try {
    const filters = {};

    for (const key of Object.keys(req.query)) {
      const value = req.query[key];

      // ❌ Ignore unknown fields
      if (!allowedFields.includes(key)) continue;

      // number fields
      if (!isNaN(value)) {
        filters[key] = Number(value);
      }
      // string fields
      else {
        filters[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }

    const states = await prisma.state.findMany({
      where: filters,
      orderBy: { state_id: "asc" },
    });

    if (states.length === 0) {
      return res.status(404).json({ msg: "Agent state is not found" });
    }

    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// POST (create new state)
router.post("/Create/:state_id", async (req, res) => {
  try {
    const id = Number(req.params.state_id);
    const { Action, Reward } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ msg: "Invalid state ID" });
    }

    if (!Action || Reward === undefined) {
      return res.status(400).json({
        msg: "Action and Reward are required",
      });
    }

    const existingState = await prisma.state.findUnique({
      where: { state_id: id },
    });

    if (existingState) {
      return res.status(400).json({ msg: "State ID already exists" });
    }

    const newState = await prisma.state.create({
      data: {
        state_id: id,
        Action,
        Reward: Number(Reward),
      },
    });

    res.status(201).json(newState);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// PUT (update state)
router.put("/update/:state_id", async (req, res) => {
  try {
    const id = Number(req.params.state_id);
    const { Action, Reward } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ msg: "Invalid state ID" });
    }

    const existingState = await prisma.state.findUnique({
      where: { state_id: id },
    });

    if (!existingState) {
      return res.status(404).json({ msg: "Agent state not found" });
    }

    const data = {};

    if (Action !== undefined) {
      data.Action = Action;
    }

    if (Reward !== undefined) {
      data.Reward = Number(Reward);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ msg: "No fields to update" });
    }

    const updatedState = await prisma.state.update({
      where: { state_id: id },
      data,
    });

    res.json({
      msg: "Agent state updated successfully",
      data: updatedState,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// DELETE (remove state)
router.delete("/delete/:state_id", async (req, res) => {
  try {
    const stateId = Number(req.params.state_id);

    if (isNaN(stateId)) {
      return res.status(400).json({ msg: "Invalid state ID" });
    }

    const deletedState = await prisma.state.delete({
      where: { state_id: stateId },
    });

    res.json({
      msg: "State deleted successfully",
      state: deletedState,
    });
  } catch (err) {
    return res.status(404).json({
      msg: "State not found",
    });
  }
});


// OPTIONAL: correct way to filter reward (RELATION SAFE EXAMPLE)
router.get("/with-reward-zero", async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      where: {
        rewards: {
          some: {
            value: 0, // change "value" to your actual Reward field
          },
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