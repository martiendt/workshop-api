import { NextFunction, Request, Response } from "express";

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).json({});
  } catch (error) {
    next(error);
  }
};
