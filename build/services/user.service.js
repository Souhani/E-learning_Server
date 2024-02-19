"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleService = exports.getAllUsersService = exports.getUserById = void 0;
const redis_1 = require("../utils/redis");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
// get user by id from redis
const getUserById = async (id, res) => {
    const userJson = await redis_1.redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            user,
        });
    }
};
exports.getUserById = getUserById;
// get all users from database
const getAllUsersService = async (res) => {
    const users = await user_model_1.default.find().sort({
        createdAt: -1
    });
    res.status(201).json({
        success: true,
        users
    });
};
exports.getAllUsersService = getAllUsersService;
// update user role
const updateUserRoleService = async (email, role, res, next) => {
    const user = await user_model_1.default.findOneAndUpdate({ email }, { role }, { new: true });
    await redis_1.redis.set(user?._id, JSON.stringify(user), "EX", 604800);
    if (!user) {
        return next(new ErrorHandler_1.default('User email not found. please create an account first to update its role', 404));
    }
    res.status(201).json({
        success: true,
        user
    });
};
exports.updateUserRoleService = updateUserRoleService;
