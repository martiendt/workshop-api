import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { validate } from "../request/invite.request.js";
import { InviteUserService } from "../services/invite.service.js";
import { ReadUserService } from "../services/read.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const invite = async (req: Request, res: Response, next: NextFunction) => {
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
    if (!token.role?.includes("invite user")) {
      throw new ApiError(403);
    }

    // invite user 1.3 check duplicate name
    const readUserService = new ReadUserService(db);
    const duplicate = await readUserService.duplicate(req.body.name);

    if (duplicate) {
      throw new ApiError(422, { name: ["name must be unique"] });
    }

    // invite user 1.4 valiation required field
    validate(req.body);

    // invite user 1.5 register user
    const inviteUserService = new InviteUserService(db);
    const result = await inviteUserService.handle(req.body, { session });

    await db.commitTransaction();

    res.status(201).json({
      code: 201,
      message: "success invite user",
      data: result,
    });
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
