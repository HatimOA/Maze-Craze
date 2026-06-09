const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const token = auth.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    req.player_id = decoded.id;

    next();
  } catch {
    return res.status(403).json({ message: "forbidden" });
  }
}

router.get("/", requireAuth, async (req, res) => {
  let limit = Number(req.query.limit || 10);

  if (limit > 100) limit = 100;

  return res.status(200).json({
    data: [],
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });
});

router.post("/", requireAuth, async (req, res) => {
  if (!req.body.state_id) {
    return res.status(400).json({
      message: "missing state_id",
    });
  }

  return res.status(201).json(req.body);
});

router.get("/:state_id", requireAuth, async (req, res) => {
  return res.status(404).json({
    message: "state not found",
  });
});

router.put("/:state_id", requireAuth, async (req, res) => {
  return res.status(404).json({
    message: "state not found",
  });
});

router.delete("/:state_id", requireAuth, async (req, res) => {
  return res.status(404).json({
    message: "state not found",
  });
});

router.post("/:state_id/recomendedState", requireAuth, async (req, res) => {
  return res.status(404).json({
    message: "state not found",
  });
});

router.delete("/:state_id/recomendedState", requireAuth, async (req, res) => {
  return res.status(404).json({
    message: "state not found",
  });
});

module.exports = router;