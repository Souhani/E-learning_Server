"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserEligibleToCourse = exports.authorizeRoles = exports.isAuthenticated = exports.updateAccessTokenFunction = void 0;
const catchAsyncErrors_1 = require("./catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const jwt_1 = require("../utils/jwt");
//updates access token  function
const updateAccessTokenFunction = async (req, res, next) => {
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
        // reset user expire to redis (expires in 7 days)
        await redis_1.redis.expire(session.userId, 604800); // EX: 7 days.
        return { res, accessToken };
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
};
exports.updateAccessTokenFunction = updateAccessTokenFunction;
// middleware to check if a user is authenticated
exports.isAuthenticated = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        let access_token = req.cookies.access_token;
        if (!access_token) {
            const newRes = await (0, exports.updateAccessTokenFunction)(req, res, next);
            if (newRes) {
                res = newRes.res;
                access_token = newRes.accessToken;
            }
        }
        let accessTokenDecoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
        if (!accessTokenDecoded) {
            const newRes = await (0, exports.updateAccessTokenFunction)(req, res, next);
            if (newRes) {
                res = newRes.res;
                access_token = newRes.accessToken;
                accessTokenDecoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN_SECRET);
            }
        }
        const user = await redis_1.redis.get(accessTokenDecoded.id);
        if (!user) {
            return next(new ErrorHandler_1.default("please login to access this resource", 400));
        }
        req.user = JSON.parse(user);
        next();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// middleware to validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// middleware to check if the user is eligible to the requested course (if the course is purchased by the user);
const isUserEligibleToCourse = (req, res, next) => {
    // if(req?.user?.role === "Admin") {
    //   return next();
    // }
    // let courseId = req.params.id;
    // if(!courseId) {
    //   courseId = req.body.courseId;
    // };
    // const userCourseList = req.user?.courses;
    // //check if the requested course is exist on the user purchased courses list.
    // const isCourseExists = userCourseList?.some((course:any) => courseId === course._id.toString());
    // if(!isCourseExists) {
    //    return next(new ErrorHandler("You are not eligible to access this course", 400));
    // };
    next();
};
exports.isUserEligibleToCourse = isUserEligibleToCourse;
