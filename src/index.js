
const express = require("express");
const app = express();
const stateRouter = require("./routes/Agents_behaviors");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api/Agents_behaviors", stateRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Not found" });
});

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown (VERY important with Prisma)
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

