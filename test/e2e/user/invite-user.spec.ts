import request from "supertest";
import { createApp } from "@src/app.js";

describe("invite user", () => {
  it("unauthorized user should receive error", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users/invite").set("Authorization", "");
    expect(response.statusCode).toEqual(401);
    expect(response.body.code).toEqual(401);
    expect(response.body.status).toEqual("Unauthorized");
    expect(response.body.message).toEqual("Authentication credentials is invalid.");
  });
  it("user that don't have permission should receive error", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users/invite").set("Authorization", "");
    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toEqual(403);
    expect(response.body.status).toEqual("Forbidden");
    expect(response.body.message).toEqual("Don't have necessary permissions for this resource.");
  });
  it("should check required fields", async () => {
    const app = await createApp();
    // TODO: user auth
    // TODO: user should have invite-user permission
    const response = await request(app).post("/v1/users/invite").set("Authorization", "");
    expect(response.statusCode).toEqual(422);
    expect(response.body.code).toEqual(422);
    expect(response.body.status).toEqual("Unprocessable Entity");
    expect(response.body.message).toEqual(
      "The request was well-formed but was unable to be followed due to semantic errors."
    );
    expect(response.body.errors.email).toEqual("The email field is required");
  });
  it("should check unique fields", async () => {
    const app = await createApp();
    // TODO: user auth
    // TODO: user should have invite-user permission
    const email = "tester@example.com";
    await request(app).post("/v1/users/invite").set("Authorization", "").send({
      email: email,
    });
    const response = await request(app).post("/v1/users/invite").set("Authorization", "").send({
      email: email,
    });
    expect(response.statusCode).toEqual(422);
    expect(response.body.code).toEqual(422);
    expect(response.body.status).toEqual("Unprocessable Entity");
    expect(response.body.message).toEqual(
      "The request was well-formed but was unable to be followed due to semantic errors."
    );
    expect(response.body.errors.email).toEqual("The email field is exists");
  });
  it("should save to database", async () => {
    const app = await createApp();
    // TODO: user auth
    // TODO: user should have invite-user permission
    const email = "tester@example.com";
    const response = await request(app).post("/v1/users/invite").set("Authorization", "").send({
      email: email,
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body._id).not.toBeNull();

    // expect new email saved to database
    const responseRead = await request(app).get("/v1/users").set("Authorization", "").send();
    expect(responseRead.body.users.length).toEqual(1);
    expect(responseRead.body.users[0].email).toEqual(email);
  });
});
