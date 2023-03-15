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
    const readManyUserService = new ReadManyUserService(db);
    const { user } = await readManyUserService.handle(req.query, { session });

    // if no data found
    if (!user.data[0]) {
      throw new ApiError(404);
    }

    await db.commitTransaction();

    // if there is data
    console.log(user);
    res.status(200).json({
      data: user.data,
      pagination: {
        page: user.pagination.page,
        pageCount: user.pagination.pageCount,
        pageSize: user.pagination.pageSize,
        totalDocument: user.pagination.totalDocument,
      },
    });
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
