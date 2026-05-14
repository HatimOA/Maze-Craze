const bcrypt = require("bcrypt");
const { resetDb, request, app, prisma } = require("./helpers");

beforeEach(resetDb);

describe("auth register", () => {
  it("registers, hashes password, returns token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "player@mazecraze.com",
        password: "1234",
        name: "Hatim Oulad Arifi",
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));

    const player = await prisma.player.findUnique({
      where: { email: "player@mazecraze.com" },
    });

    expect(player.password).not.toBe("1234");
    expect(await bcrypt.compare("1234", player.password)).toBe(true);
  });

  it("rejects duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "dup@mazecraze.com",
        password: "1234",
        name: "User",
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "dup@mazecraze.com",
        password: "1234",
        name: "User",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        password: "1234",
        name: "User",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@mazecraze.com",
        name: "User",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test2@mazecraze.com",
        password: "1234",
      });

    expect(res.status).toBe(400);
  });
});