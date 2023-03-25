import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export class ReadUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: string, options: any) {
    try {
      const userRepository = new UserRepository(this.db);
      const user = await userRepository.read(id, options);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        branch_assigned: user.branch_assigned,
        branch_access: user.branch_access,
      };
    } catch (error) {
      return;
    }
  }
}
