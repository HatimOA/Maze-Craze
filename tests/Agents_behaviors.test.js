import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";

const { resetDb } = require("./helpers");

beforeEach(resetDb);

const token = jwt.sign(
  { id: 1 },
  process.env.JWT_SECRET || "supersecretkey"
);

describe("Agents_behaviors API", () => {
  it("GET /api/Agents_behaviors returns 200 with valid token", async () => {
    const res = await request(app)
      .get("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
  });

  it("POST /api/Agents_behaviors rejects missing state_id", async () => {
    const res = await request(app)
      .post("/api/Agents_behaviors")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});