import { NextFunction, Request, Response } from "express";

export const catchAsyncErrors =
  (myAsyncFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(myAsyncFunc(req, res, next)).catch((err) => next(err));
  };
