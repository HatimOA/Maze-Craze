const {
  request,
  app,
  resetDb,
  registerAndLogin,
  createPost,
} = require("./helpers");

beforeEach(resetDb);

describe("pagination clamping", () => {
  it("clamps limit above 100 to 100", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get("/api/Agents_behaviors?limit=999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(100);
  });

  it("treats page=0 as page=1", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get("/api/Agents_behaviors?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.page).toBe(1);
  });

  it("treats page=-1 as page=1", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get("/api/Agents_behaviors?page=-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.page).toBe(1);
  });
});

describe("state_id length boundary", () => {
  it("accepts a state_id of exactly 255 characters", async () => {
    const token = await registerAndLogin();

    const longId = "a".repeat(255);

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .send({ state_id: longId, action: "No operation", reward: "0" });

    expect(res.status).toBe(201);
  });

  it("returns 400 for a state_id of 256 characters", async () => {
    const token = await registerAndLogin();

    const longId = "a".repeat(256);

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .send({ state_id: longId, action: "No operation", reward: "0" });

    expect(res.status).toBe(400);
  });
});

describe("ID parsing", () => {
  it("returns 404 for unknown state", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/Agents_behaviors/22")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 for another unknown state", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/Agents_behaviors/20")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("file size boundary", () => {
  const FIVE_MB = 5 * 1024 * 1024;

  it("accepts a file just under 5 MB", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .field("state_id", "12")
      .field("action", "Fire-left")
      .field("reward", "0")
      .attach("image", Buffer.alloc(FIVE_MB - 1), {
        filename: "ok.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
  });

  it("rejects a file at exactly 5 MB", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .field("state_id", "12")
      .field("action", "Fire-left")
      .field("reward", "0")
      .attach("image", Buffer.alloc(FIVE_MB), {
        filename: "limit.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
  });
});

describe("bcrypt 72-byte ceiling", () => {
  it("rejects passwords over 72 bytes", async () => {
    const tooLong = "a".repeat(100);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "player72@mazecraze.com",
        password: tooLong,
        name: "player72",
      });

    expect(res.status).toBe(400);
  });

  it("accepts a password of exactly 72 bytes", async () => {
    const exactly72 = "a".repeat(72);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "player72@mazecraze.com",
        password: exactly72,
        name: "player72",
      });

    expect(res.status).toBe(201);
  });
});