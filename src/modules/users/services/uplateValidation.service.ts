import { ObjectId } from "mongodb";
import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection, { AggregrateOptionsInterface } from "@src/database/connection.js";

export class UpdateValidationUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: any, name: any, options: AggregrateOptionsInterface) {
    const query = { page: 1, pageSize: 10 };
    const pipeline = [
      { $group: { _id: "$_id", name: { $first: "$name" } } },
      { $match: { _id: { $ne: new ObjectId(id) }, name: { $eq: name } } },
      { $project: { id: "$_id", name: "$name" } },
    ];
    const userRepository = new UserRepository(this.db);
    const result = await userRepository.aggregate(pipeline, query, options);
    if (result.data.length > 0) {
      return true;
    }
    return false;
  }
}
