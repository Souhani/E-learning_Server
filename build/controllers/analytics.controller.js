"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersAnalytics = exports.getCoursesAnalytics = exports.getUsersAnalytics = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const analytics_generator_1 = require("../utils/analytics.generator");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
// get users analytics only for admin
exports.getUsersAnalytics = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const data = await (0, analytics_generator_1.generateLast12MonthsData)(user_model_1.default);
        res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get courses analytics only for admin
exports.getCoursesAnalytics = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const data = await (0, analytics_generator_1.generateLast12MonthsData)(course_model_1.default);
        res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get orders analytics only for admin
exports.getOrdersAnalytics = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const data = await (0, analytics_generator_1.generateLast12MonthsData)(order_model_1.default);
        res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
