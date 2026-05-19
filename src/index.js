require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");
const logger = require("./lib/logger");

const PORT = process.env.PORT || 3000;

let server;

// --------------------- SAFETY CHECK
if (!app || typeof app.listen !== "function") {
  console.error("❌ app is invalid:", app);
  process.exit(1);
}

// --------------------- START SERVER
function startServer() {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
}

// IMPORTANT: only start if NOT in test environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

// --------------------- CLEAN SHUTDOWN
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

module.exports = app; // IMPORTANT for tests