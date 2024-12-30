"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';
    //Wrong mongodb id error
    if (err.name === 'CastError') {
        const message = `Resoource not found. Invalid: ${err.path}`;
        const statusCode = 400;
        err = new ErrorHandler_1.default(message, statusCode);
    }
    //Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        const statusCode = 400;
        err = new ErrorHandler_1.default(message, statusCode);
    }
    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Json web token is invalid, try again';
        const statusCode = 400;
        err = new ErrorHandler_1.default(message, statusCode);
    }
    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Json web token is expired, try again';
        const statusCode = 400;
        err = new ErrorHandler_1.default(message, statusCode);
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.default = ErrorMiddleware;
