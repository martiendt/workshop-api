import { NextFunction, Request, Response } from "express";
import { UserInterface } from "../entities/user.entity.js";
import { validate } from "../request/invite.request.js";
import { InviteUserService } from "../services/invite.service.js";
import { ReadUserService } from "../services/read.service.js";
import { db } from "@src/database/database.js";

export const invite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.startSession();

    db.startTransaction();

    const readUserService = new ReadUserService(db);
    const duplicate = await readUserService.duplicate(req.body.name);

    if (duplicate) {
      res.status(409).json({ code: 409, message: "name is unique, name already taken" });
    } else {
      validate(req.body);

      const inviteUserService = new InviteUserService(db);
      const result = await inviteUserService.handle(req.body, { session });

      await db.commitTransaction();

      res.status(201).json({
        code: 201,
        message: "success invite user",
      });
    }
  } catch (error) {
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
