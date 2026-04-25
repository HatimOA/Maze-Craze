const prisma = require("../lib/prisma");

async function isOwner(req, res, next) {
  try {
    const { state_id } = req.params;

    const state = await prisma.state.findUnique({
      where: { state_id }, // correct field
      include: {
        player: true,      // correct relation
      },
    });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    //  check ownership (depends on your schema)
    if (state.player_id !== req.player.player_id) {
      return res.status(403).json({
        error: "You can only modify your own state",
      });
    }

    req.state = state;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

module.exports = isOwner;