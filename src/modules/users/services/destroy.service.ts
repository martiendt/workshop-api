import DatabaseConnection from "@src/database/connection.js";

export class DestroyUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle() {
    return {};
  }
}
