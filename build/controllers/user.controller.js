"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsres = exports.updateProfilePicture = exports.updateUserPassword = exports.updateUserInfo = exports.socialAuth = exports.getUserInfo = exports.updateAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.registrationUser = void 0;
require("dotenv").config();
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
const user_service_1 = require("../services/user.service");
const cloudinary_1 = __importDefault(require("cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.registrationUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler_1.default("Email already exist", 400));
        }
        const user = {
            name,
            email,
            password,
        };
        const activationToken = createActivationToken(user);
        const { activationCode, token } = activationToken;
        const data = { user: { name: user.name }, activationCode };
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                template: "activation-mail.ejs",
                subject: "Activate your account",
                data,
            });
            res.status(201).json({
                seccess: true,
                message: `please check your email: ${user.email} to activate your account`,
                activationToken: token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
function createActivationToken(user) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return {
        activationCode,
        token,
    };
}
exports.activateUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { activation_code, activation_token } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (activation_code !== newUser.activationCode) {
            return next(new ErrorHandler_1.default("Invalide activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const isUserExist = await user_model_1.default.findOne({ email });
        if (isUserExist) {
            return next(new ErrorHandler_1.default("Email already exist", 400));
        }
        const user = await user_model_1.default.create({
            name,
            email,
            password,
        });
        res.status(201).json({ success: true });
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default("Please enter email and passowrd", 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res, next);
    }
    catch (error) {
        next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.logoutUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    try {
        const accessTokenDecoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        // delete user session from redis
        const sessionId = accessTokenDecoded.sessionId;
        redis_1.redis.del(sessionId);
        redis_1.redis.del(req?.user?._id);
        // reset client cookies
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        res.status(200).json({
            success: true,
            message: "user loged out successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateAccessToken = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const message = "Login to access this resource";
        if (!refresh_token) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const refreshTokenDecoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        if (!refreshTokenDecoded) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const sessionString = await redis_1.redis.get(refreshTokenDecoded.sessionId);
        if (!sessionString) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        ;
        const session = JSON.parse(sessionString);
        if (!session.valid) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        ;
        const accessToken = jsonwebtoken_1.default.sign({ id: session.userId, sessionId: session.sessionId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '5m',
        });
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.status(200).json({
            sucess: true,
            accessToken,
        });
        // reset user expire to redis (expires in 7 days)
        redis_1.redis.expire(session.userId, 604800); // EX: 7 days.
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// get user info
exports.getUserInfo = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        // get user info from redis
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// social auth
exports.socialAuth = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;
        const nextAuthToken = req.cookies["next-auth.session-token"];
        if (!nextAuthToken) {
            return next(new ErrorHandler_1.default("Token is reqiured for social authentication", 400));
        }
        const isNextAuthSessionExist = await redis_1.redis.get(`user:session:${nextAuthToken}`);
        if (!isNextAuthSessionExist) {
            return next(new ErrorHandler_1.default("Session Expired", 400));
        }
        // check if the nextAuthSession is for the same requested user email
        const userSession = await redis_1.redis.get(`user:${JSON.parse(isNextAuthSessionExist).userId}`);
        if (!userSession) {
            return next(new ErrorHandler_1.default("User session not found", 400));
        }
        if (JSON.parse(userSession).email !== email) {
            return next(new ErrorHandler_1.default("Something went wrong!", 400));
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            const newUser = await user_model_1.default.create({
                name,
                email,
                avatar: {
                    public_id: "",
                    url: avatar
                },
            });
            (0, jwt_1.sendToken)(newUser, 200, res, next);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res, next);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserInfo = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        //update email
        if (user && email) {
            const isEmailExist = await user_model_1.default.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler_1.default("Email already exist", 400));
            }
            user.email = email;
        }
        //update name
        if (user && name) {
            user.name = name;
        }
        // save changes to the database
        await user?.save();
        // save chnages to the cache
        await redis_1.redis.set(userId, JSON.stringify(user), "EX", 604800);
        // responde with the new user info
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserPassword = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler_1.default("please enter old and new password", 400));
        }
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId).select("+password");
        if (user?.password === undefined) {
            return next(new ErrorHandler_1.default("Invalid user", 400));
        }
        const isPasswordMatch = await user.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid old password", 400));
        }
        user.password = newPassword;
        // save the changes to the database
        await user.save();
        // save the changes to the cache
        await redis_1.redis.set(userId, JSON.stringify(user), "EX", 604800);
        // response with the new user info
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateProfilePicture = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (avatar && user) {
            if (user.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
            }
            ;
            const myAvatarCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150
            });
            user.avatar = {
                public_id: myAvatarCloud.public_id,
                url: myAvatarCloud.secure_url
            };
        }
        ;
        // save new profile pic to the database
        await user?.save();
        // save new profile pic to cache
        await redis_1.redis.set(userId, JSON.stringify(user), "EX", 604800);
        // response with new changes
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// get all users only for admin
exports.getAllUsres = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        await (0, user_service_1.getAllUsersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// update user role (only for admin).
exports.updateUserRole = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) {
            return next(new ErrorHandler_1.default('please provide both email and role', 400));
        }
        ;
        if (!email.includes("@")) {
            return next(new ErrorHandler_1.default('not a valid email', 404));
        }
        (0, user_service_1.updateUserRoleService)(email, role, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// admin delete user 
exports.deleteUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    try {
        const userId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return next(new ErrorHandler_1.default('user not found', 404));
        }
        ;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return next(new ErrorHandler_1.default('user not found', 404));
        }
        ;
        await user.deleteOne({ userId });
        await redis_1.redis.del(userId);
        const accessTokenDecoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        // delete user session from redis
        const sessionId = accessTokenDecoded.sessionId;
        redis_1.redis.del(sessionId);
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
