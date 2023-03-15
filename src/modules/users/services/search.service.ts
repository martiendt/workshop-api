import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { QueryInterface } from "@src/database/connection.js";

export class SearchUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(query: any) {
    const iQuery: QueryInterface = {
      fields: "",
      filter: {
        name: new RegExp("/" + query.search.name + "/i"),
        email: new RegExp("/" + query.search.email + "/i"),
      },
      page: query.page,
      pageSize: query.pageSize,
      sort: "",
    };
    const userRepository = new UserRepository(this.db);
    const user = await userRepository.readMany(iQuery);
    return {
      user,
    };
  }
}
