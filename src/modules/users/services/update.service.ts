import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { DocumentInterface, UpdateOptionsInterface } from "@src/database/connection.js";

export class UpdateUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: string, doc: DocumentInterface, session: UpdateOptionsInterface) {
    const userRepository = new UserRepository(this.db);
    await userRepository.update(id, doc, session);
    return;
  }
}
