import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import notificationModel from "../models/notification.model";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

// get all notiications only for admin
export const getAllNotifications = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
 try {
    const notifications = await notificationModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      notifications
    });
 } catch(error:any) {
    next(new ErrorHandler(error.message, 500));
 }
});

//update notification status -- valid for admin
export const updateNotification = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
   try {
    const notificationId = req.params.id;
    const notification = await notificationModel.findById(notificationId);
    if(!notification) {
        return next(new ErrorHandler("notification not found", 404));
    } else {
       notification.status = "read";
       await notification.save();
       const notifications = await notificationModel.find().sort({ createdAt: -1 });
       res.status(201).json({
        success: true,
        notifications
       })
    }
   } catch(error:any) {
    next(new ErrorHandler(error.message, 500));
 }
});

// delete notifications created more than 30 days and have "read" status ---only admin.
cron.schedule('0 0 0 * * *', async () => {
   const thirtyDaysAgo = new Date(Date.now() - (1000 * 1 * 60 * 60 * 24 * 30));
   await notificationModel.deleteMany({
      status: "read",
      createdAt: {
         $lt: thirtyDaysAgo
      }
   });
   console.log('delete notifications created more than 30 days and have "read" status ');
 });

 