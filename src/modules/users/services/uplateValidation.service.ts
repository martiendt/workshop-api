import { UserRepository } from "../repositories/user.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export class UpdateValidationUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(id: any, doc: any) {
    const pipeline = [
      { $group: { _id: "$_id", name: { $first: "$name" } } },
      { $match: { _id: { $ne: `ObjectId("${id}")` }, name: { $eq: doc } } },
      { $project: { id: "$_id", name: "$name" } },
    ];
    const userRepository = new UserRepository(this.db);
    const result = await userRepository.aggregate(pipeline, doc);
    return result;
  }
}
