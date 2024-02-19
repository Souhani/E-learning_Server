"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const orderSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        // required: true
    }
}, { timestamps: true });
const orderModel = (0, mongoose_1.model)('Order', orderSchema);
exports.default = orderModel;
