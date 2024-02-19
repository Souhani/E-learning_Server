"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const notificationSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    },
    userId: {
        type: String
    },
}, { timestamps: true });
const notificationModel = (0, mongoose_1.model)("Notification", notificationSchema);
exports.default = notificationModel;
