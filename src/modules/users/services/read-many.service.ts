import DatabaseConnection from "@src/database/connection.js";

export class ReadManyUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle() {
    return {};
  }
}
