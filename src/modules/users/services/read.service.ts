import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { QueryInterface } from "@src/database/connection.js";

export class ReadUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: string, options: any) {
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.read(id);
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
  public async duplicate(name: string) {
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
