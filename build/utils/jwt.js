"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require('dotenv').config();
const redis_1 = require("./redis");
const sessions_1 = require("./sessions");
;
// parse environment variables to integrate with fallback values
const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || '300', 10);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || '1200', 10);
// token options
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 60 * 1000),
    maxAge: accessTokenExpires * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};
const sendToken = async (user, statusCode, res, next) => {
    // upload user to redis (expires in 7 days)
    redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800); // EX: 7 days.
    //create session
    const session = await (0, sessions_1.createSession)(user, next);
    // generate tokens
    const accessToken = user.signAccessToken(session.sessionId);
    const refreshToken = user.signRefreshToken(session.sessionId);
    // token options in production
    if (process.env.NODE_ENV === 'production') {
        exports.refreshTokenOptions.secure = true;
        exports.accessTokenOptions.secure = true;
    }
    ;
    // set the cookies in the headers
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    // send the cookies to client
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
