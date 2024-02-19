"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersService = exports.newOrder = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const order_model_1 = __importDefault(require("../models/order.model"));
const newOrder = async (data, res, next) => {
    try {
        return await order_model_1.default.create(data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.newOrder = newOrder;
// get all orders from database
const getAllOrdersService = async (res) => {
    const orders = await order_model_1.default.find().sort({
        createdAt: -1
    });
    res.status(201).json({
        success: true,
        orders
    });
};
exports.getAllOrdersService = getAllOrdersService;
