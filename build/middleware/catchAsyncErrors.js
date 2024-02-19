"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsyncErrors = void 0;
const catchAsyncErrors = (myAsyncFunc) => (req, res, next) => {
    Promise.resolve(myAsyncFunc(req, res, next)).catch((err) => next(err));
};
exports.catchAsyncErrors = catchAsyncErrors;
