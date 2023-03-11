import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { ReadManyUserService } from "../services/read-many.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.startSession();

    db.startTransaction();

    // invite user 1.1 verify token
    const authorizationHeader = req.headers.authorization ?? false;
    if (!authorizationHeader) {
      throw new ApiError(401);
    }
    const verifyTokenUserService = new VerifyTokenUserService(db);
    const token = await verifyTokenUserService.handle(authorizationHeader);

    // invite user 1.2 check role permission
    if (!token.role?.includes("read invite user")) {
      throw new ApiError(403);
    }

    // read data user
    let search;
    search = { $regex: req.query.search, $options: "i" };
    if (!req.query.search) search = null;

    const filter = {
      status: req.query.status || { $exists: true },
      name: req.query.name || search || { $exists: true },
    };
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    const readManyUserService = new ReadManyUserService(db);
    const result = await readManyUserService.handle(filter, page, pageSize);

    // if no data found
    if (!result.user.data[0]) {
      return res.status(204).json({ code: 204, status: "No Content", message: "data not found" });
    }

    await db.commitTransaction();

    // if there is data
    res.status(200).json(result);
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
