const {
  request,
  app,
  resetDb,
  registerAndLogin,
  createState,
} = require("./helpers");

beforeEach(resetDb);

describe("POST /api/Agents_behaviors/:state_id/recomendedState", () => {
  it("returns 404 when unknown state", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/Agents_behaviors/99999/recomendedState")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 201 on first recommendation", async () => {
    const token = await registerAndLogin();

    const state = await createState(token);

    const res = await request(app)
      .post(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.recomendedState).toBe(true);
    expect(res.body.porcentage).toBe(1);
  });

  it("is idempotent (double recommend still 1)", async () => {
    const token = await registerAndLogin();

    const state = await createState(token);

    await request(app)
      .post(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .post(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/Agents_behaviors/${state.body.state_id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.porcentage).toBe(1);
    expect(res.body.recomendedState).toBe(true);
  });
});

describe("DELETE /api/Agents_behaviors/:state_id/recomendedState", () => {
  it("returns 200 when removing non-existing recommendation", async () => {
    const token = await registerAndLogin();

    const state = await createState(token);

    const res = await request(app)
      .delete(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recomendedState).toBe(false);
    expect(res.body.porcentage).toBe(0);
  });

  it("removes recommendation after being set", async () => {
    const token = await registerAndLogin();

    const state = await createState(token);

    await request(app)
      .post(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/Agents_behaviors/${state.body.state_id}/recomendedState`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recomendedState).toBe(false);
    expect(res.body.porcentage).toBe(0);
  });
});