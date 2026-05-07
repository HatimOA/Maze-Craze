const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");

// ================= AUTH =================
router.use(authenticate);

// ================= MULTER =================
const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "uploads"
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `maze-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}${ext}`
    );
  },
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed"));
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ================= HELPERS =================
function toNumber(v) {
  const n = Number(v);

  return isNaN(n)
    ? null
    : n;
}

function distance(a, b) {
  return (
    Math.abs(a.x - b.x) +
    Math.abs(a.y - b.y)
  );
}

function deleteImage(imageUrl) {
  if (!imageUrl) return;

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    imageUrl
  );

  fs.unlink(filePath, () => {});
}

//  KEYWORD PARSER
function parseKeywords(keywords) {
  // already array
  if (Array.isArray(keywords)) {
    return keywords
      .map((k) =>
        k.toLowerCase().trim()
      )
      .filter(Boolean);
  }

  // comma separated string
  if (typeof keywords === "string") {
    return keywords
      .split(",")
      .map((k) =>
        k.toLowerCase().trim()
      )
      .filter(Boolean);
  }

  return [];
}

// ================= COOPERATE / DEFECT =================
function getBehaviorKeyword(state) {
  const p1 = {
    x: state.p1_x,
    y: state.p1_y,
  };

  const p2 = {
    x: state.p2_x,
    y: state.p2_y,
  };

  const r = {
    x: state.r_x,
    y: state.r_y,
  };

  const d1 = distance(p1, r);
  const d2 = distance(p2, r);

  // similar distances = cooperate
  return Math.abs(d1 - d2) <= 1
    ? "cooperate"
    : "defect";
}

// ================= FORMAT RESPONSE =================
function formatState(state) {
  return {
    ...state,

    // extract player name only
    playerName:
      state.player?.name || null,

    // remove player object
    player: undefined,

    // extract keywords only
    keywords:
      state.keywords.map(
        (k) => k.name
      ),
  };
}

// ================= CREATE STATE =================
router.post(
  "/create",
  upload.single("image"),

  async (req, res) => {
    try {
      let {
        state_id,
        player_id,

        p1_x,
        p1_y,

        p2_x,
        p2_y,

        r_x,
        r_y,

        robbers_left,
        visibility,

        keywords = [],
      } = req.body;

      if (
        !state_id ||
        !player_id
      ) {
        return res.status(400).json({
          msg: "Missing required fields",
        });
      }

      // normalize numbers
      const stateObj = {
        p1_x: toNumber(p1_x),
        p1_y: toNumber(p1_y),

        p2_x: toNumber(p2_x),
        p2_y: toNumber(p2_y),

        r_x: toNumber(r_x),
        r_y: toNumber(r_y),
      };

      // automatic behavior keyword
      const behaviorKeyword =
        getBehaviorKeyword(stateObj);

      // parse keywords safely
      keywords =
        parseKeywords(keywords);

      // merge keywords
      const finalKeywords = [
        ...new Set([
          ...keywords,
          behaviorKeyword,
        ]),
      ];

      // multer uploaded image
      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      const newState =
        await prisma.state.create({
          data: {
            state_id,

            ...stateObj,

            robbers_left:
              toNumber(
                robbers_left
              ),

            visibility: Math.max(
              0,
              Math.min(
                3,
                Number(
                  visibility ?? 0
                )
              )
            ),

            imageUrl,

            player: {
              connect: {
                id: Number(
                  player_id
                ),
              },
            },

            // keywords relation
            keywords: {
              connectOrCreate:
                finalKeywords.map(
                  (name) => ({
                    where: { name },

                    create: {
                      name,
                    },
                  })
                ),
            },
          },

          include: {
            player: true,
            keywords: true,
          },
        });

      res
        .status(201)
        .json(
          formatState(newState)
        );
    } catch (err) {
      console.error(err);

      res.status(500).json({
        msg: "Server error",
      });
    }
  }
);

// ================= UPDATE STATE =================
router.put(
  "/update/:state_id",

  isOwner,

  upload.single("image"),

  async (req, res) => {
    try {
      const { state_id } =
        req.params;

      const existingState =
        await prisma.state.findUnique({
          where: {
            state_id,
          },

          include: {
            player: true,
            keywords: true,
          },
        });

      if (!existingState) {
        return res.status(404).json({
          msg: "State not found",
        });
      }

      let {
        p1_x,
        p1_y,

        p2_x,
        p2_y,

        r_x,
        r_y,

        robbers_left,
        visibility,

        keywords = [],
      } = req.body;

      const stateObj = {
        p1_x: toNumber(p1_x),
        p1_y: toNumber(p1_y),

        p2_x: toNumber(p2_x),
        p2_y: toNumber(p2_y),

        r_x: toNumber(r_x),
        r_y: toNumber(r_y),
      };

      // automatic behavior
      const behaviorKeyword =
        getBehaviorKeyword(stateObj);

      // parse keywords safely
      keywords =
        parseKeywords(keywords);

      const finalKeywords = [
        ...new Set([
          ...keywords,
          behaviorKeyword,
        ]),
      ];

      // existing image
      let imageUrl =
        existingState.imageUrl;

      // replace image if uploaded
      if (req.file) {
        deleteImage(
          existingState.imageUrl
        );

        imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedState =
        await prisma.state.update({
          where: {
            state_id,
          },

          data: {
            ...stateObj,

            robbers_left:
              toNumber(
                robbers_left
              ),

            visibility: Math.max(
              0,
              Math.min(
                3,
                Number(
                  visibility ?? 0
                )
              )
            ),

            imageUrl,

            keywords: {
              // remove old
              set: [],

              // add new
              connectOrCreate:
                finalKeywords.map(
                  (name) => ({
                    where: { name },

                    create: {
                      name,
                    },
                  })
                ),
            },
          },

          include: {
            player: true,
            keywords: true,
          },
        });

      res.json(
        formatState(updatedState)
      );
    } catch (err) {
      console.error(err);

      res.status(500).json({
        msg: "Server error",
      });
    }
  }
);

// ================= GET STATES =================
router.get("/", async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(
        req.query.page
      ) || 1
    );

    const limit = Math.max(
      1,
      Math.min(
        100,
        parseInt(
          req.query.limit
        ) || 5
      )
    );

    const skip =
      (page - 1) * limit;

    const keywordArray =
      req.query.keywords
        ? req.query.keywords
            .split(",")
            .map((k) =>
              k
                .trim()
                .toLowerCase()
            )
        : [];

    const whereClause =
      keywordArray.length > 0
        ? {
            keywords: {
              some: {
                name: {
                  in: keywordArray,
                },
              },
            },
          }
        : {};

    const [states, total] =
      await Promise.all([
        prisma.state.findMany({
          skip,
          take: limit,

          orderBy: {
            state_id: "desc",
          },

          where: whereClause,

          include: {
            player: true,
            keywords: true,
          },
        }),

        prisma.state.count({
          where: whereClause,
        }),
      ]);

    res.json({
      page,
      limit,

      total,

      totalPages:
        Math.ceil(
          total / limit
        ),

      data: states.map(
        formatState
      ),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
});

// ================= DELETE STATE =================
router.delete(
  "/delete/:state_id",

  isOwner,

  async (req, res) => {
    try {
      const { state_id } =
        req.params;

      const state =
        await prisma.state.findUnique({
          where: {
            state_id,
          },
        });

      if (!state) {
        return res.status(404).json({
          msg: "State not found",
        });
      }

      deleteImage(
        state.imageUrl
      );

      await prisma.state.delete({
        where: {
          state_id,
        },
      });

      res.json({
        msg: "Deleted successfully",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        msg: "Server error",
      });
    }
  }
);

// ================= ERROR HANDLER =================
router.use(
  (err, req, res, next) => {
    if (
      err instanceof
        multer.MulterError ||
      err.message ===
        "Only image files are allowed"
    ) {
      return res.status(400).json({
        msg: err.message,
      });
    }

    next(err);
  }
);

module.exports = router;



