import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("ENDPOINT DISCOVERY TESTS", () => {

  it("GET /api responds in any form", async () => {
    const res = await request(app).get("/api");

    expect([200, 404]).toContain(res.status);
  });

  it("POST /api/auth/register exists", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `test_${Date.now()}@mail.com`,
        password: "1234"
      });

    expect([200, 201, 400]).toContain(res.status);
  });

});