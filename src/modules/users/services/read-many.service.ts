import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { QueryInterface, ReadManyOptionsInterface } from "@src/database/connection.js";

export class ReadManyUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(query: any, doc: ReadManyOptionsInterface) {
    if (query.search) {
      query.search.name = { $regex: new RegExp(query.search.name), $options: "i" };
    }
    const filterSearch = { ...query.filter, ...query.search };

    const iQuery: QueryInterface = {
      fields: "",
      filter: filterSearch,
      page: query.page,
      pageSize: query.pageSize,
      sort: "",
    };
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.readMany(iQuery, doc);
    return {
      user,
    };
  }
}
