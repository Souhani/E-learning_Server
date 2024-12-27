import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/ErrorHandler";

const ErrorMiddleware =  (err:any, req: Request, res:Response, next:NextFunction) => {
   err.statusCode = err.statusCode || 500;
   err.message = err.message || 'Internal server error';
   //Wrong mongodb id error
   if(err.name === 'CastError'){
    const message:string = `Resoource not found. Invalid: ${err.path}`;
    const statusCode:number = 400;
    err = new ErrorHandler(message, statusCode);
   }

   //Duplicate key error
   if(err.code === 11000){
    const message:string = `Duplicate ${Object.keys(err.keyValue)} entered`;
    const statusCode:number = 400;
    err = new ErrorHandler(message, statusCode);
   }

   // Wrong JWT error
   if(err.name === 'JsonWebTokenError') {
    const message:string = 'Json web token is invalid, try again';
    const statusCode:number = 400;
    err = new ErrorHandler(message, statusCode);
   }

   // JWT expired error
   if(err.name === 'TokenExpiredError'){
    const message:string = 'Json web token is expired, try again';
    const statusCode:number = 400;
    err = new ErrorHandler(message, statusCode);
   }

   return res.status(err.statusCode).json({
    success: false,
    message: err.message,
   });
};

export default ErrorMiddleware;