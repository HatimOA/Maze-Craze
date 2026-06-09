require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");
const logger = require("./lib/logger");

const { createFolders } = require("./ai/setup");

createFolders(); // keep your AI setup

const PORT = process.env.PORT || 3000;

console.log("INDEX FILE LOADED");
console.log("PORT =", PORT);

// --------------------- SAFETY CHECK
if (!app || typeof app.listen !== "function") {
  console.error("❌ app is invalid:", app);
  process.exit(1);
}

// --------------------- START SERVER (ONLY LOCALHOST)
let server;

function startServer() {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

// --------------------- LOCAL ONLY
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}

// --------------------- CLEAN SHUTDOWN (LOCAL ONLY)
async function shutdown() {
  console.log("\nShutting down...");

  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
    });
  }

  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected");
  } catch (err) {
    console.error("Prisma disconnect error:", err);
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ===================== IMPORTANT FOR VERCEL =====================
// This is REQUIRED for Vercel deployment
module.exports = app;