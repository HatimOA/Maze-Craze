const express = require("express");
const app = express();

const authRouter = require("./routes/auth");
const stateRouter = require("./routes/Agents_behaviors");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/Agents_behaviors", stateRouter);

// Test route (VERY useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Prisma shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});