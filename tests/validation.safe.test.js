import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("INPUT VALIDATION SAFETY", () => {

  it("rejects empty POST payload safely", async () => {
    const res = await request(app)
      .post("/api/Agents_behaviors")
      .send({});

    expect([400, 401, 500]).toContain(res.status);
  });

  it("rejects invalid token format safely", async () => {
    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", "Bearer invalid.token");

    expect([401, 403]).toContain(res.status);
  });

  it("handles unknown route safely", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
  });

});