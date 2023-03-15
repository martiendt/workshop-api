import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { DestroyUserService } from "../services/destroy.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
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

    // invite user 1.2.1 verify token
    if (!token.role?.includes("cancel invite user")) {
      throw new ApiError(403);
    }

    // 1.2.2 delete/cancel invitation
    const destroyUserService = new DestroyUserService(db);
    await destroyUserService.handle(req.params.id, { session });

    await db.commitTransaction();

    res.status(204).json({});
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
