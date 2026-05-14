const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");

/**
 * CLEAN DATABASE (FIXED ORDER + MISSING TABLES)
 */
async function resetDb() {
  await prisma.recommendation?.deleteMany().catch(() => {});
  await prisma.stateKeyword.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.state.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.player.deleteMany();
}

/**
 * FIXED: guaranteed unique email (NO COLLISIONS)
 */
async function registerAndLogin(
  email = `player${Date.now()}_${Math.random()}@mazecraze.com`,
  name = "SALIMA",
  password = "1234"
) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, name, password });

  if (res.status !== 201) {
    throw new Error(
      `registerAndLogin failed: ${res.status} ${JSON.stringify(res.body)}`
    );
  }

  if (!res.body.token) {
    throw new Error("registerAndLogin failed: token missing");
  }

  return res.body.token;
}

/**
 * CREATE STATE
 */
async function createState(token, data = {}) {
  return request(app)
    .post("/api/Agents_behaviors")
    .set("Authorization", `Bearer ${token}`)
    .send({
      state_id: data.state_id ?? "6",
      action: data.action ?? "Move-right",
      reward: data.reward ?? "1",
    });
}

/**
 * ALIAS REQUIRED BY TESTS
 */
async function createPost(token, data = {}) {
  return createState(token, data);
}

/**
 * GET STATES
 */
async function getStates(token, query = "") {
  return request(app)
    .get(`/api/Agents_behaviors${query}`)
    .set("Authorization", `Bearer ${token}`);
}

/**
 * DELETE STATE
 */
async function deleteState(token, state_id) {
  return request(app)
    .delete(`/api/Agents_behaviors/${state_id}`)
    .set("Authorization", `Bearer ${token}`);
}

module.exports = {
  request,
  app,
  prisma,
  resetDb,
  registerAndLogin,
  createState,
  createPost,
  getStates,
  deleteState,
};