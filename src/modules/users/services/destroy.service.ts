import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export class DestroyUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: any, options: any) {
    const userRepository = new UserRepository(this.db);
    await userRepository.delete(id, options);
    return;
  }
}
