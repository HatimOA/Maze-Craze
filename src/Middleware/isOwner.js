const prisma = require("../lib/prisma");

async function isOwner(req, res, next) {
  try {
    const { state_id } = req.params;

    if (!state_id || state_id.length > 255) {
      return res.status(400).json({ message: "Invalid state_id" });
    }

    const state = await prisma.state.findUnique({
      where: { state_id },
    });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    // FIX: use req.user (NOT req.player)
    if (!req.user?.player_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (state.player_id !== req.user.player_id) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    req.state = state;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = isOwner;