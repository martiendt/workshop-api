import request from "supertest";
import { createApp } from "@src/app.js";
import { db } from "@src/database/database.js";

let token = "";
let tokenN = "";
let userId = "";

describe("end to end testing", () => {
  describe("login", () => {
    it("login as Admin has all role", async () => {
      const app = await createApp();

      // login as Admin
      const responseAdmin = await request(app).post("/v1/auth/signin").send({
        username: "admin",
        password: "admin123",
      });
      token = responseAdmin.body.accessToken;
      expect(responseAdmin.statusCode).toEqual(200);
    });
    it("login as user has no role", async () => {
      const app = await createApp();

      // login as users
      const responseUser = await request(app).post("/v1/auth/signin").send({
        username: "usertesting",
        password: "user1234",
      });
      tokenN = responseUser.body.accessToken;
      expect(responseUser.statusCode).toEqual(200);
    });
  });

  describe("invite user", () => {
    it("1.5 invite success", async () => {
      const app = await createApp();
      const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "no role",
        branch_assigned: "1",
        branch_access: "1",
      });
      userId = response.body._id;
      expect(response.statusCode).toEqual(201);
      expect(response.body._id).not.toBeUndefined();
    });
    it("1.1 invite user failed because user is not login yet", async () => {
      const app = await createApp();
      const response = await request(app).post("/v1/users").send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(401);
    });
    it("1.2 invite failed, dont have permission", async () => {
      const app = await createApp();
      const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${tokenN}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(403);
    });
    it("1.3 invite failed, name unique", async () => {
      const app = await createApp();
      const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(422);
    });
    it("1.4 invite failed, column required", async () => {
      const app = await createApp();
      const response = await request(app).post("/v1/users").set("Authorization", `Bearer ${token}`).send({
        email: "test5@gmail.com",
        name: "test5",
        role: "1",
        branch_assigned: "1",
      });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe("read user", () => {
    describe("read all user", () => {
      it("1.1 read all user failed because user is not login yet", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users");
        expect(response.statusCode).toEqual(401);
      });
      it("1.2 read all failed, dont have permission", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users").set("Authorization", `Bearer ${tokenN}`);
        expect(response.statusCode).toEqual(403);
      });
      it("1.3 read all success", async () => {
        const app = await createApp();
        const response = await request(app).get("/v1/users").set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(200);
      });
      it("1.4 read all (filtered) success / have data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?filter[branch_assigned]=1")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(200);
      });
      it("1.5 read all (filtered) failed / no data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?filter[branch_assigned]=9")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(404);
      });
      it("1.6 read all (search) success / have data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?search[name]=usertesting")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(200);
      });
      it("1.7 read all (search) failed / no data ", async () => {
        const app = await createApp();
        const response = await request(app)
          .get("/v1/users?search[name]=nouserexist")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(404);
      });
    });

    describe("read one / show user detail", () => {
      it("1.1 read one user failed because user is not login yet", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`);
        expect(response.statusCode).toEqual(401);
      });
      it("1.2 read one failed, dont have permission", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`).set("Authorization", `Bearer ${tokenN}`);
        expect(response.statusCode).toEqual(403);
      });
      it("1.3 read one user success", async () => {
        const app = await createApp();
        const response = await request(app).get(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toEqual(200);
      });
    });
  });

  describe("update user", () => {
    it("1.1 update user failed because user is not login yet", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(401);
    });
    it("1.2 update failed, dont have permission", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).set("Authorization", `Bearer ${tokenN}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(403);
    });
    it("1.3 update failed, name unique", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`).send({
        email: "usertesting@gmail.com",
        name: "usertesting",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(422);
    });
    it("1.4 update failed, column required", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
      });
      expect(response.statusCode).toEqual(422);
    });
    it("1.5 update success", async () => {
      const app = await createApp();
      const response = await request(app).patch(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`).send({
        email: "test8@gmail.com",
        name: "test8",
        role: "1",
        branch_assigned: "1",
        branch_access: "1",
      });
      expect(response.statusCode).toEqual(204);
    });
  });

  describe("delete user", () => {
    it("1.1 destroy user failed because user is not login yet", async () => {
      const app = await createApp();
      const response = await request(app).delete(`/v1/users/${userId}`);
      expect(response.statusCode).toEqual(401);
    });
    it("1.2 destroy failed, dont have permission", async () => {
      const app = await createApp();
      const response = await request(app).delete(`/v1/users/${userId}`).set("Authorization", `Bearer ${tokenN}`);
      expect(response.statusCode).toEqual(403);
    });
    it("1.3 destroy success", async () => {
      const app = await createApp();
      const response = await request(app).delete(`/v1/users/${userId}`).set("Authorization", `Bearer ${token}`);
      expect(response.statusCode).toEqual(204);
    });
  });
});

afterAll((done) => {
  db.close();
  done();
});
