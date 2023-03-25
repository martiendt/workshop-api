import { exec } from "child_process";
import * as dotenv from "dotenv";
import { ObjectId } from "mongodb";
import request from "supertest";
import { db } from "../../setup";
import { createApp } from "@src/app.js";

dotenv.config();

let token = "";
let tokenN = "";
let userId = "";

// data
const userData = {
  email: "data@gmail.com",
  name: "data",
  role: "1",
  branch_assigned: "1",
  branch_access: "1",
};

// error message
const error401 = {
  code: 401,
  message: "Authentication credentials is invalid.",
  status: "Unauthorized",
};

const error403 = {
  code: 403,
  message: "Don't have necessary permissions for this resource.",
  status: "Forbidden",
};

beforeAll(async () => {
  exec("node cli db:seed");
  const app = await createApp();

  // login as Admin
  const responseAdmin = await request(app).post("/v1/auth/signin").send({
    username: "admin",
    password: "admin123",
  });
  token = responseAdmin.body.accessToken;
  // check status code
  expect(responseAdmin.statusCode).toEqual(200);
  // check response body
  expect(responseAdmin.body).toEqual({
    accessToken: responseAdmin.body.accessToken,
    email: "admin@example.com",
    name: "Admin",
    refreshToken: responseAdmin.body.refreshToken,
    role: ["invite user", "edit invite user", "read invite user", "read user", "cancel invite user"],
    username: "admin",
  });

  // login as users
  const responseUser = await request(app).post("/v1/auth/signin").send({
    username: "usertesting",
    password: "user1234",
  });
  tokenN = responseUser.body.accessToken;
  // check status code
  expect(responseUser.statusCode).toEqual(200);
  // check response body
  expect(responseUser.body).toEqual({
    accessToken: responseUser.body.accessToken,
    email: "usertesting@gmail.com",
    name: "usertesting",
    refreshToken: responseUser.body.refreshToken,
    role: "0",
    username: "usertesting",
  });

  // insert user to delete
  const response1 = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send(userData);
  userId = response1.body._id;
});

afterAll(async () => {
  db.collection("users").deleteMany({});
});

describe("delete user", () => {
  it("1.1 destroy user failed because user is not login yet", async () => {
    const app = await createApp();
    const response = await request(app).delete(`/v1/users/${userId}`);
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 destroy failed, dont have permission", async () => {
    const app = await createApp();
    const response = await request(app).delete(`/v1/users/${userId}`).set("Authorization", `Bearer ${tokenN}`);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 destroy success", async () => {
    const app = await createApp();
    const response = await request(app).delete(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
    // check status code
    expect(response.statusCode).toEqual(204);
    // check response body
    expect(response.body).toEqual({});
    // check database
    const users = db.collection("users");
    const userDelated = await users.findOne({ _id: new ObjectId(userId) });
    expect(userDelated).toBeNull();
  });
});
