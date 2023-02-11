import DatabaseConnection from "@src/database/connection.js";

export class ReadUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: string, options: any) {
    return {
      _id: "user._id",
      name: "user.name",
      email: "user.email",
      username: "user.username",
      role: "user.role",
    };
  }
}
