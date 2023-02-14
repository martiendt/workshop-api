import { Request, Response, NextFunction } from "express";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization ?? "";

  if (authorizationHeader === "") {
    res.status(401).json({ code: 401, message: "Unauthorize" });
  } else {
    const verifyTokenUserService = new VerifyTokenUserService(db);
    const result = await verifyTokenUserService.handle(authorizationHeader);

    if (result.role === "admin operations") {
      next();
    } else {
      res.status(403).json({ code: 403, message: "Forbidden" });
    }
  }
};

export default authMiddleware;
