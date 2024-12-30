"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = __importDefault(require("../models/course.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const order_service_1 = require("../services/order.service");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const redis_1 = require("../utils/redis");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.createOrder = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        // get body data
        const { courseId, payment_info } = req.body;
        // check is payment authorized
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new ErrorHandler_1.default("Payment not authorized!", 400));
                }
            }
            else {
                return next(new ErrorHandler_1.default("Payment not authorized!", 400));
            }
        }
        else {
            return next(new ErrorHandler_1.default("Payment not authorized!", 400));
        }
        // get user
        const user = await user_model_1.default.findById(req.user?._id);
        if (!user) {
            return next(new ErrorHandler_1.default("user not found", 404));
        }
        ;
        // check if course already purchased
        const isCourseExist = user?.courses.some((course) => courseId === course._id.toString());
        if (isCourseExist) {
            return next(new ErrorHandler_1.default("You already purchased this course", 400));
        }
        ;
        // get course
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("course not found", 404));
        }
        // create order
        const data = {
            userId: user._id,
            userEmail: user.email,
            courseId: course._id,
            courseName: course.name,
            price: course.price,
            payment_info
        };
        const order = await (0, order_service_1.newOrder)(data, res, next);
        if (!order) {
            return next(new ErrorHandler_1.default("Error creating new order", 400));
        }
        ;
        // send order confornation email to user
        const EmailData = {
            order: {
                userName: user.name,
                courseName: course.name,
                cost: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            }
        };
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                template: "order-confirmation.ejs",
                subject: "order confirnation",
                data: EmailData
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        ;
        // add course to user courses list
        user.courses.push({
            _id: course._id
        });
        await user.save();
        await redis_1.redis.set(req.user?._id, JSON.stringify(user), "EX", 604800);
        // create admin order notification
        await notification_model_1.default.create({
            title: "New order",
            message: `a new order for the course: ${course.name}`,
            userId: user._id
        });
        // increase sold number for the course
        course.purchased ? course.purchased += 1 : course.purchased = 1;
        course.save();
        //send response to client
        res.status(200).json({
            success: true,
            order
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all Orders only for admin
exports.getAllOrders = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        await (0, order_service_1.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// send stripe publishable key
exports.sendStripePublishableKey = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        res.status(200).json({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// new payment
exports.newPayment = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
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
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
