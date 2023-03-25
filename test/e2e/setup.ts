import { MongoClient } from "mongodb";
import { db as dbApp } from "@src/database/database.js";
let connection: any;
let db: any;

beforeAll(async () => {
  connection = await MongoClient.connect(process.env.TEST_DATABASE_URL || "");
  db = await connection.db(process.env.TEST_DATABASE_NAME);
  db.collection("users").insertOne({ name: "test" });
});
afterAll(() => {
  connection.close();
  dbApp.close();
});

export { db, connection };
