import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("SMOKE TESTS (safe expansion)", () => {

  it("API server is alive", async () => {
    const res = await request(app).get("/");

    expect([200, 404]).toContain(res.status);
  });

  it("auth route exists", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "1234"
    });

    expect([200, 400, 401]).toContain(res.status);
  });

  it("agents endpoint responds", async () => {
    const res = await request(app).get("/api/Agents_behaviors");

    expect([200, 401, 403]).toContain(res.status);
  });

});