import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { ReadUserService } from "../services/read.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.startSession();

    db.startTransaction();

    // verify token
    const authorizationHeader = req.headers.authorization ?? false;
    if (!authorizationHeader) {
      throw new ApiError(401);
    }
    const verifyTokenUserService = new VerifyTokenUserService(db);
    const token = await verifyTokenUserService.handle(authorizationHeader);

    // edit invitation user 1.2 check role permission
    if (!token.role?.includes("edit invite user")) {
      throw new ApiError(403);
    }

    // read data user by id
    const readUserService = new ReadUserService(db);
    const result = await readUserService.handle(req.params.id, { session });

    // if there is no user data or wrong id
    if (!result) {
      throw new ApiError(404);
    }

    await db.commitTransaction();

    res.status(200).json({
      id: result._id,
      name: result.name,
      email: result.email,
      role: result.role,
      branch_access: result.branch_access,
      branch_assigned: result.branch_assigned,
    });
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
