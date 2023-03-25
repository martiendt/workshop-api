import * as dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import request from "supertest";
import { createApp } from "@src/app.js";
import { db as db2 } from "@src/database/database.js";

dotenv.config();

let token = "";
let tokenN = "";
let userId = "";
let connection: any;
let db: any;

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

const userDataUpdate = {
  email: "update@gmail.com",
  name: "update",
  role: "2",
  branch_assigned: "2",
  branch_access: "2",
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
  // start connection to mongodb datanbase testing
  connection = await MongoClient.connect(process.env.TEST_DATABASE_URL || "");
  db = await connection.db(process.env.TEST_DATABASE_NAME);

  // initiaalize app
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
  await connection.close();
  db2.close();
});

describe("end to end testing", () => {
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

  describe("read user", () => {
    describe("read all user", () => {
      it("1.1 read all user failed because user is not login yet", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users");
        // check status code
        expect(response.statusCode).toEqual(401);
        // check response body
        expect(response.body).toEqual(error401);
        // check database
      });
      it("1.2 read all failed, dont have permission", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users").set("Authorization", `Bearer ${tokenN}`);
        // check status code
        expect(response.statusCode).toEqual(403);
        // check response body
        expect(response.body).toEqual(error403);
        // check response database
      });
      it("1.3 read all success", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users").set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body.data).not.toHaveLength(0);
        // check database
      });
      it("1.4 read all (filtered) success / have data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?filter[branch_assigned]=1")
          .set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body.data).not.toHaveLength(0);
        // check database
      });
      it("1.5 read all (filtered) failed / no data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?filter[branch_assigned]=9")
          .set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body.data).toHaveLength(0);
        // check database
      });
      it("1.6 read all (search) success / have data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?search[name]=usertesting")
          .set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body.data).not.toHaveLength(0);
        // check database
      });
      it("1.7 read all (search) failed / no data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?search[name]=nouserexist")
          .set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body.data).toHaveLength(0);
        // check database
      });
    });

    describe("read one / show user detail", () => {
      it("1.1 read one user failed because user is not login yet", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`);
        // check status code
        expect(response.statusCode).toEqual(401);
        // check response body
        expect(response.body).toEqual(error401);
        // check database
      });
      it("1.2 read one failed, dont have permission", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`).set("Authorization", `Bearer ${tokenN}`);
        // check status code
        expect(response.statusCode).toEqual(403);
        // check response body
        expect(response.body).toEqual(error403);
        // check database
      });
      it("1.3 read one user success", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
        // check status code
        expect(response.statusCode).toEqual(200);
        // check response body
        expect(response.body).toEqual({
          id: userId,
          ...userData,
        });
        // check database
      });
    });
  });

  describe("update user", () => {
    it("1.1 update user failed because user is not login yet", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).send(userDataUpdate);
      // check status code
      expect(response.statusCode).toEqual(401);
      // check response body
      expect(response.body).toEqual(error401);
      // check database
    });
    it("1.2 update failed, dont have permission", async () => {
      const app = await createApp();
      const response = await request(app)
        .patch(`/v1/users/${userId}`)
        .set("Authorization", `Bearer ${tokenN}`)
        .send(userDataUpdate);
      // check status code
      expect(response.statusCode).toEqual(403);
      // check response body
      expect(response.body).toEqual(error403);
      // check response database
    });
    it("1.3 update failed, name unique", async () => {
      const app = await createApp();
      const response = await request(app)
        .patch(`/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(userDataExist);
      // check status code
      expect(response.statusCode).toEqual(422);
      // check response body
      expect(response.body).toEqual(error422UniqueName);
      // check database
    });
    it("1.4 update failed, column required", async () => {
      const app = await createApp();
      const response = await request(app)
        .patch(`/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(userDataNotComplete);
      // check status code
      expect(response.statusCode).toEqual(422);
      // check response body
      expect(response.body).toEqual(error422RequiredField);
      // check database
    });
    it("1.5 update success", async () => {
      const app = await createApp();
      const response = await request(app)
        .patch(`/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(userDataUpdate);
      // check status code
      expect(response.statusCode).toEqual(204);
      // check response body
      expect(response.body).toEqual({});
      // check database
      const users = db.collection("users");
      const userInserted = await users.findOne({ _id: new ObjectId(userId) });
      expect(userInserted).toMatchObject({
        _id: new ObjectId(userId),
        ...userDataUpdate,
      });
    });
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
});
