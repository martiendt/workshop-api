import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export class UpdateUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: any, doc: any, session: any) {
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.update(id, doc, session);
    return {
      _id: user.upsertedId,
    };
  }
}
