const prisma = require("../src/lib/prisma");

const {
  request,
  app,
  resetDb,
  registerAndLogin,
  createState,
} = require("./helpers");

beforeEach(resetDb);

describe("auth on protected endpoints", () => {
  it("returns 401 when the Authorization header is missing", async () => {
    const res = await request(app).get("/api/Agents_behaviors");
    expect(res.status).toBe(401);
  });

  it("returns 401 when the header does not start with 'Bearer '", async () => {
    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", "Token abc");

    expect(res.status).toBe(401);
  });

  it("returns 403 when the token is malformed", async () => {
    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", "Bearer not.a.real.jwt");

    expect(res.status).toBe(403);
  });
});

describe("GET /api/Agents_behaviors", () => {
  it("returns posts with data, page, limit, total, totalPages", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      data: expect.any(Array),
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it("does not include player.password in any post", async () => {
    const token = await registerAndLogin();
    await createState(token);

    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`);

    expect(JSON.stringify(res.body)).not.toContain("password");
  });
});

describe("GET /api/Agents_behaviors/:state_id", () => {
  it("returns 404 for an unknown state", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/Agents_behaviors/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("state not found");
  });

  it("returns 200 with correct shape", async () => {
    const token = await registerAndLogin();

    const created = await createState(token, { state_id: "5" });

    const res = await request(app)
      .get(`/api/Agents_behaviors/${created.body.state_id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      state_id: "6",
      playerName: "SALIMA",
      porcentage: 0,
      stateRecommendation: false,
    });
  });
});

describe("POST validation", () => {
  it("returns 400 when state is missing", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .send({ action: "Move-down", reward: "+1" });

    expect(res.status).toBe(400);
  });

  it("sets player_id from JWT", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        state_id: "8",
        action: "move-up",
        reward: "-1",
        player_id: 99999,
      });

    expect(res.status).toBe(201);

    const post = await prisma.state.findFirst({
      where: { state_id: res.body.state_id },
    });

    expect(post.player_id).not.toBe(99999);
  });
});

describe("PUT authorization", () => {
  it("returns 403 when editing someone else's state", async () => {
    const aliceToken = await registerAndLogin("alice@mazecraze.com", "Alice");
    const created = await createState(aliceToken, {
      state_id: "AliceState",
    });

    const bobToken = await registerAndLogin("bob@mazecraze.com", "Bob");

    const res = await request(app)
      .put(`/api/Agents_behaviors/${created.body.state_id}`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send({ state_id: "9", action: "Move-right", reward: "+1" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE state", () => {
  it("removes state", async () => {
    const token = await registerAndLogin();

    const created = await createState(token);

    const res = await request(app)
      .delete(`/api/Agents_behaviors/${created.body.state_id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const after = await prisma.state.findUnique({
      where: { state_id: created.body.state_id },
    });

    expect(after).toBeNull();
  });
});

describe("unknown routes", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Not found");
  });
});

describe("body parsing", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(res.status).toBe(400);
  });

  it("returns 400 for wrong content type", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "text/plain")
      .send("hello");

    expect(res.status).toBe(400);
  });
});