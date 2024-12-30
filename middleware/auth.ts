import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { Session } from "../utils/sessions";
import { accessTokenOptions } from "../utils/jwt";


//updates access token  function
export const updateAccessTokenFunction = async (req: Request, res: Response, next: NextFunction): Promise<{res:Response,accessToken:string}|void> => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const message = "Login to access this resource";
      if (!refresh_token) {
        return next(new ErrorHandler(message, 400));
      }
      const refreshTokenDecoded = jwt.verify(
        refresh_token as string,
        process.env.REFRESH_TOKEN_SECRET as Secret
      ) as JwtPayload;
      if (!refreshTokenDecoded) {
        return next(new ErrorHandler(message, 400));
      }
      const sessionString = await redis.get(refreshTokenDecoded.sessionId as string);
      if (!sessionString) {
        return next(new ErrorHandler(message, 400));
      };
       const session:Session = JSON.parse(sessionString);
       if (!session.valid) {
        return next(new ErrorHandler(message, 400));
      };
      const accessToken = jwt.sign(
        { id: session.userId,  sessionId: session.sessionId},
        process.env.ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn: '5m',
        }
      );
      res.cookie("access_token", accessToken, accessTokenOptions);
    // reset user expire to redis (expires in 7 days)
     await redis.expire(session.userId,604800); // EX: 7 days.
     return {res, accessToken};
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  };
// middleware to check if a user is authenticated
export const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let access_token = req.cookies.access_token as string;
      if (!access_token) {
         const newRes = await updateAccessTokenFunction(req, res, next);
         if(newRes) {
          res = newRes.res;
          access_token = newRes.accessToken;
         }
      }
      let accessTokenDecoded = jwt.verify(
        access_token as string,
        process.env.ACCESS_TOKEN_SECRET as Secret
      ) as JwtPayload;
      if (!accessTokenDecoded) {
        const newRes = await updateAccessTokenFunction(req, res, next);
        if(newRes) {
          res = newRes.res;
          access_token = newRes.accessToken;
          accessTokenDecoded = jwt.verify(
            access_token as string,
            process.env.ACCESS_TOKEN_SECRET as Secret
          ) as JwtPayload;
         }
      }
      const user = await redis.get(accessTokenDecoded.id);
      if (!user) {
        return next(new ErrorHandler("please login to access this resource", 400));
      }
      req.user = JSON.parse(user);
      next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400))
    }
  }
);

// middleware to validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// middleware to check if the user is eligible to the requested course (if the course is purchased by the user);
export const isUserEligibleToCourse = (req:Request, res:Response, next:NextFunction) => {
  // if(req?.user?.role === "Admin") {
  //   return next();
  // }
  // let courseId = req.params.id;
  // if(!courseId) {
  //   courseId = req.body.courseId;
  // };
  // const userCourseList = req.user?.courses;
  // //check if the requested course is exist on the user purchased courses list.
  // const isCourseExists = userCourseList?.some((course:any) => courseId === course._id.toString());
  // if(!isCourseExists) {
  //    return next(new ErrorHandler("You are not eligible to access this course", 400));
  // };
  next();
}
