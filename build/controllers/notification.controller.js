"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.getAllNotifications = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
// get all notiications only for admin
exports.getAllNotifications = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notifications
        });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, 500));
    }
});
//update notification status -- valid for admin
exports.updateNotification = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const notificationId = req.params.id;
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            return next(new ErrorHandler_1.default("notification not found", 404));
        }
        else {
            notification.status = "read";
            await notification.save();
            const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
            res.status(201).json({
                success: true,
                notifications
            });
        }
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, 500));
    }
});
// delete notifications created more than 30 days and have "read" status ---only admin.
node_cron_1.default.schedule('0 0 0 * * *', async () => {
    const thirtyDaysAgo = new Date(Date.now() - (1000 * 1 * 60 * 60 * 24 * 30));
    await notification_model_1.default.deleteMany({
        status: "read",
        createdAt: {
            $lt: thirtyDaysAgo
        }
    });
    console.log('delete notifications created more than 30 days and have "read" status ');
});
