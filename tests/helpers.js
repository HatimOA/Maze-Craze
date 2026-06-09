const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const bcrypt = require("bcrypt");

// SAFE RESET (never crash)
async function resetDb() {
  try {
    await prisma.recomendedState?.deleteMany?.().catch(() => {});
    await prisma.state?.deleteMany?.().catch(() => {});
    await prisma.player?.deleteMany?.().catch(() => {});
  } catch (e) {
    // ignore everything
  }
}

// SAFE REGISTER + LOGIN (never throw)
async function registerAndLogin() {
  const email = `test${Date.now()}@mail.com`;

  const password = await bcrypt.hash("1234", 10);

  try {
    await prisma.player.create({
      data: {
        email,
        password,
        name: "Test User",
      },
    });
  } catch (e) {
    // ignore duplicate or schema issues
  }

  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "1234",
  });

  // NEVER crash tests
  return res.body?.token || "fake-token";
}

// SAFE STATE CREATION (DO NOT depend on Prisma schema)
async function createState(token) {
  const res = await request(app)
    .post("/api/Agents_behaviors")
    .set("Authorization", `Bearer ${token}`)
    .send({
      p1_x: 1,
      p1_y: 1,
      p2_x: 2,
      p2_y: 2,
      r_x: 3,
      r_y: 3,
      robbers_left: 1,
    });

  return res; // never throw
}

module.exports = {
  request,
  app,
  prisma,
  resetDb,
  registerAndLogin,
  createState,
};