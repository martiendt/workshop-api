import request from "supertest";
import { createApp } from "@src/app.js";
import { db } from "@src/database/database.js";

let token = "";
let userId = "";

beforeAll(async () => {
  const app = await createApp();

  const response = await request(app).post("/v1/auth/signin").send({
    username: "admin",
    password: "admin123",
  });
  token = response.body.accessToken;
});

describe("end to end testing", () => {
  // Positive case invite user
  it("invite", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send({
      email: "test4@gmail.com",
      name: "test4",
      role: "1",
      branch_assigned: "1",
      branch_access: "1",
    });
    userId = response.body._id;
    expect(response.statusCode).toEqual(201);
    expect(response.body._id).not.toBeUndefined();
  });
  // Negative case invite user
  it("invite user failed because request is not authorized", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").send({
      email: "test2@gmail.com",
      name: "test2",
      role: "1",
      branch_assigned: "1",
      branch_access: "1",
    });
    expect(response.statusCode).toEqual(401);
  });
  it("read all", async () => {
    const app = await createApp();
    const response = await request(app).get("/v1/users").set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
  it("read one", async () => {
    const app = await createApp();
    const response = await request(app).get(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
  it("update", async () => {
    const app = await createApp();
    const response = await request(app).patch(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`).send({
      email: "test4@gmail.com",
      name: "test4",
      role: "1",
      branch_assigned: "1",
      branch_access: "1",
    });
    expect(response.statusCode).toEqual(204);
  });
  it("destroy", async () => {
    const app = await createApp();
    const response = await request(app).delete(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(204);
  });
});

afterAll((done) => {
  db.close();
  done();
});
