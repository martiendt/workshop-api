import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export class InviteUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(doc: any, session: any) {
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.create(doc, session);
    return {
      _id: user._id,
    };
  }
}
