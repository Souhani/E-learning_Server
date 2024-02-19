import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import courseModel from "../models/course.model";
import userModel, { IUser } from "../models/user.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notification.model";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//create order
export interface IOrderData {
    userId: string;
    userEmail:string;
    courseId: string;
    courseName: string;
    price: number;
    payment_info: object;
}
export const createOrder = catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
   try {
    // get body data
    const { courseId, payment_info } = req.body as IOrderData;
    // check is payment authorized
    if(payment_info) {
        if("id" in payment_info) {
            const paymentIntentId = payment_info.id;
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if(paymentIntent.status !== "succeeded") {
                return next(new ErrorHandler("Payment not authorized!", 400));
            }
        } else {
            return next(new ErrorHandler("Payment not authorized!", 400));
        }
    } else {
        return next(new ErrorHandler("Payment not authorized!", 400));
    }
    // get user
    const user = await userModel.findById(req.user?._id) as IUser;
    if(!user) {
        return next(new ErrorHandler("user not found", 404));
    };
    // check if course already purchased
    const isCourseExist = user?.courses.some((course:any) => courseId === course._id.toString());
    if(isCourseExist) {
        return next(new ErrorHandler("You already purchased this course", 400));
    };

    // get course
    const course = await courseModel.findById(courseId);
    if(!course) {
        return next(new ErrorHandler("course not found", 404));
    }

    // create order
    const data:IOrderData = {
        userId: user._id,
        userEmail: user.email,
        courseId: course._id,
        courseName: course.name,
        price: course.price,
        payment_info
    };
    const order = await newOrder(data, res, next);
    if(!order) {
        return next(new ErrorHandler("Error creating new order", 400));
    };

    // send order confornation email to user
    const EmailData = {
       order: {
        userName : user.name,
        courseName: course.name,
        cost: course.price,
        date: new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})
       }
    };
    try {
        await sendMail({
            email: user.email,
            template: "order-confirmation.ejs",
            subject: "order confirnation",
            data: EmailData
        });
    } catch(error:any) {
        return next(new ErrorHandler(error.message, 500));
    };

   // add course to user courses list
   user.courses.push({
    _id: course._id
   });
   await user.save();
   await redis.set(req.user?._id, JSON.stringify(user), "EX", 604800);
   // create admin order notification
   await notificationModel.create({
    title: "New order",
    message: `a new order for the course: ${course.name}`,
    userId: user._id
   });

   // increase sold number for the course
   course.purchased ?  course.purchased += 1 : course.purchased = 1;
   course.save();
   //send response to client
   res.status(200).json({
    success: true,
    order
   });

   } catch(error:any) {
    return next(new ErrorHandler(error.message, 500));
   }
});

// get all Orders only for admin
export const getAllOrders = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
      await getAllOrdersService(res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
});

// send stripe publishable key
export const sendStripePublishableKey = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
        res.status(200).json({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
});

// new payment
export const newPayment = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            metadata: {
                company: "E-learing"
            },
            automatic_payment_methods: {
                enabled: true
            }
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

