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

const userDataExist = {
  email: "exist@gmail.com",
  name: "exist",
  role: "1",
  branch_assigned: "1",
  branch_access: "1",
};

const userDataNotComplete = {
  email: "notcomplete@gmail.com",
  name: "notcomplete",
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

const error422UniqueName = {
  code: 422,
  errors: { name: ["name must be unique"] },
  message: "The request was well-formed but was unable to be followed due to semantic errors.",
  status: "Unprocessable Entity",
};

const error422RequiredField = {
  code: 422,
  errors: {
    branch_access: ["The branch access field is required."],
    branch_assigned: ["The branch assigned field is required."],
    role: ["The role field is required."],
  },
  message: "The request was well-formed but was unable to be followed due to semantic errors.",
  status: "Unprocessable Entity",
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
});

afterAll(async () => {
  db.collection("users").deleteMany({});
});
// describe("", () => {
describe("invite user", () => {
  it("1.1 invite user failed because user is not login yet", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").send(userData);
    // check status code
    expect(response.statusCode).toEqual(401);
    // check response body
    expect(response.body).toEqual(error401);
    // check database
  });
  it("1.2 invite failed, dont have permission", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${tokenN}`).send(userData);
    // check status code
    expect(response.statusCode).toEqual(403);
    // check response body
    expect(response.body).toEqual(error403);
    // check response database
  });
  it("1.3 invite failed, name unique", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send(userDataExist);
    // check status code
    expect(response.statusCode).toEqual(422);
    // check response body
    expect(response.body).toEqual(error422UniqueName);
    // check database
  });
  it("1.4 invite failed, column required", async () => {
    const app = await createApp();
    const response = await request(app)
      .post("/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(userDataNotComplete);
    // check status code
    expect(response.statusCode).toEqual(422);
    // check response body
    expect(response.body).toEqual(error422RequiredField);
    // check database
  });
  it("1.5 invite success", async () => {
    const app = await createApp();
    const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send(userData);
    userId = response.body._id;
    // check status code
    expect(response.statusCode).toEqual(201);
    // check response body
    expect(response.body._id).not.toBeUndefined();
    // check database
    const users = db.collection("users");
    const userInserted = await users.findOne({ _id: new ObjectId(userId) });
    expect(userInserted).toMatchObject({
      _id: new ObjectId(userId),
      ...userData,
    });
  });
});
// });
