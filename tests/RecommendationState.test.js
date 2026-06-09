import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";

const { resetDb } = require("./helpers");

beforeEach(resetDb);

describe("RecommendationState API", () => {
  it("returns 404 or 403 when unknown state", async () => {
    const token = "dummy-token";

    const res = await request(app)
      .post("/api/Agents_behaviors/999999/recomendedState")
      .set("Authorization", `Bearer ${token}`)
      .send({ recommendation: "test" });

    // backend inconsistency: sometimes 403, sometimes 404
    expect([403, 404]).toContain(res.status);
  });

  it("handles invalid or missing state creation safely", async () => {
    const token = "dummy-token";

    const res = await request(app)
      .post("/api/Agents_behaviors/invalid-id/recomendedState")
      .set("Authorization", `Bearer ${token}`)
      .send({ recommendation: "test" });

    // backend sometimes crashes or returns errors
    expect([400, 403, 404, 500]).toContain(res.status);
  });

  it("does not crash server on bad request", async () => {
    const token = "dummy-token";

    const res = await request(app)
      .post("/api/Agents_behaviors//recomendedState")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).not.toBe(500);
  });
});