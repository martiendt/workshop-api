import request from "supertest";
import { createApp } from "@src/app.js";

describe("end to end testing", () => {
  it("invite", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").set("Authorization", "");
    expect(response.statusCode).toEqual(201);
    expect(response.body._id).not.toBeUndefined();
  });
});
