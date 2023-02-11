import request from "supertest";
import { createApp } from "@src/app.js";

describe("end to end testing", () => {
  // Positive case invite user
  it("invite", async () => {
    const app = await createApp();
    const response = await (
      await request(app).post("/v1/users")
    ).headers({
      Authorization: "<token>",
    });
    expect(response.statusCode).toEqual(201);
    expect(response._id).not.toBeUndefined();
  });
  // Negative case invite user
  it("invite user failed because request is not authorized", async () => {
    const app = await createApp();
    const response = await (
      await request(app).post("/v1/users")
    ).body({
      name: "",
      email: "",
    });
    expect(response.statusCode).toEqual(201);
    expect(response._id).not.toBeUndefined();
  });
  it("read all", async () => {
    const app = await createApp();
    const response = await request(app).get("/v1/users");
    expect(response.statusCode).toEqual(200);
  });
  it("read one", async () => {
    const app = await createApp();
    const response = await request(app).get("/v1/users/<object-id>");
    expect(response.statusCode).toEqual(200);
  });
  it("update", async () => {
    const app = await createApp();
    const response = await request(app).patch("/v1/users/<object-id>");
    expect(response.statusCode).toEqual(204);
  });
  it("destroy", async () => {
    const app = await createApp();
    const response = await request(app).delete("/v1/users/<object-id>");
    expect(response.statusCode).toEqual(204);
  });
});
