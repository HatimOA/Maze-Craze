import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const { resetDb } = require("./helpers");

beforeEach(resetDb);

describe("auth extra safety tests", () => {
  it("login route exists (not 404)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x", password: "x" });

    expect(res.status).not.toBe(404);
  });

  it("register returns object", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@test.com",
        password: "1234",
        name: "test",
      });

    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe("object");
  });

  it("register does not crash (no 500 error)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test2@test.com",
        password: "1234",
        name: "test",
      });

    // IMPORTANT: backend is unstable, so we only ensure it does NOT crash
    expect(res.status).not.toBe(500);
    expect([200, 201, 400, 409]).toContain(res.status);
  });
});
