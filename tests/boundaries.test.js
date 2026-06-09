import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";

beforeEach(() => {});

describe("pagination safety test", () => {
  it("limit parameter does not crash API", async () => {
    const res = await request(app)
      .get("/api/Agents_behaviors?limit=999");

    // we only care that server does NOT crash
    expect([200, 401, 403]).toContain(res.status);
  });
});