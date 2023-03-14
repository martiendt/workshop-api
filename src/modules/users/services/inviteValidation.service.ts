import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { QueryInterface } from "@src/database/connection.js";

export class InviteValidationUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(name: string) {
    const iQuery: QueryInterface = {
      fields: "",
      filter: { name: name },
      page: 1,
      pageSize: 1,
      sort: "",
    };
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.readMany(iQuery);
    if (user.data[0]) {
      return true;
    } else {
      return false;
    }
  }
}
