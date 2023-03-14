import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { validate } from "../request/edit.request.js";
import { UpdateUserService } from "../services/update.service.js";
import { UpdateValidationUserService } from "../services/uplateValidation.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.startSession();

    db.startTransaction();

    // edit invitation user 1.1 verify token
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

    // edit invitation user 1.3 check duplicate name
    const updateValidationUserService = new UpdateValidationUserService(db);
    const duplicate = await updateValidationUserService.handle(req.body.id, req.body.name);

    if (duplicate) {
      throw new ApiError(422, { name: ["name must be unique"] });
    }

    // edit invitation user 1.4 valiation required field
    validate(req.body);

    // edit invitation user 1.5 update user
    const updateUserService = new UpdateUserService(db);
    await updateUserService.handle(req.params.id, req.body, { session });

    await db.commitTransaction();

    res.status(204);
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
