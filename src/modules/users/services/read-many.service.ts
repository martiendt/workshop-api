import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { QueryInterface } from "@src/database/connection.js";

export class ReadManyUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(filter: any, page: any, pageSize: any) {
    const iQuery: QueryInterface = {
      fields: "",
      filter: filter,
      page: page,
      pageSize: pageSize,
      sort: "",
    };
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.readMany(iQuery);
    return {
      user,
    };
  }
}
