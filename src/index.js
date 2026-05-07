const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

const authRouter = require("./routes/auth");
const stateRouter = require("./routes/Agents_behaviors");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 3000;

// =====================
// PATHS
// =====================

const publicPath = path.join(
  __dirname,
  "..",
  "public"
);

const indexPath = path.join(
  publicPath,
  "index.html"
);

// =====================
// MIDDLEWARE
// =====================

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

// =====================
// LOGGER
// =====================

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// =====================
// STATIC FILES
// =====================

app.use(express.static(publicPath));

app.use(
  "/uploads",
  express.static(
    path.join(publicPath, "uploads")
  )
);

// =====================
// ROUTES
// =====================

app.use("/api/auth", authRouter);

app.use(
  "/api/Agents_behaviors",
  stateRouter
);

// =====================
// FRONTEND
// =====================

app.get("/", (req, res) => {
  if (!fs.existsSync(indexPath)) {
    return res
      .status(500)
      .send("index.html missing");
  }

  res.sendFile(indexPath);
});

// =====================
// 404
// =====================

app.use((req, res) => {
  res.status(404).json({
    msg: "Not found",
  });
});

// =====================
// ERROR HANDLER
// =====================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    msg: err.message || "Server error",
  });
});

// =====================
// START SERVER
// =====================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});

// =====================
// CLEANUP
// =====================

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
