import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import courseModel from "../models/course.model";
import orderModel from "../models/order.model";

// get users analytics only for admin
export const getUsersAnalytics = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
   try {
    const data = await generateLast12MonthsData(userModel);
    res.status(200).json({
        success: true,
        data
    });
   } catch(error:any) {
    return next(new ErrorHandler(error.message, 500))
   }
});

// get courses analytics only for admin
export const getCoursesAnalytics = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
    try {
     const data = await generateLast12MonthsData(courseModel);
     res.status(200).json({
         success: true,
         data
     });
    } catch(error:any) {
     return next(new ErrorHandler(error.message, 500))
    }
 });
 
// get orders analytics only for admin
export const getOrdersAnalytics = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
    try {
     const data = await generateLast12MonthsData(orderModel);
     res.status(200).json({
         success: true,
         data
     });
    } catch(error:any) {
     return next(new ErrorHandler(error.message, 500))
    }
 })