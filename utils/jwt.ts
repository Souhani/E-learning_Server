require('dotenv').config();
import { NextFunction, Response } from "express"
import { IUser } from "../models/user.model"
import { redis } from "./redis";
import { Session, createSession } from "./sessions";

interface ITokenOptins {
    expires: Date,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none' | undefined,
    secure?: boolean
};
// parse environment variables to integrate with fallback values
const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || '300', 10);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || '1200', 10);
// token options
export const accessTokenOptions: ITokenOptins = {
    expires: new Date( Date.now() + accessTokenExpires * 60 * 1000),
    maxAge: accessTokenExpires * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV==='production' ? 'none' : 'lax'
};
export const refreshTokenOptions: ITokenOptins = {
    expires: new Date( Date.now() + refreshTokenExpires * 24  * 60 * 60 * 1000),
    maxAge: refreshTokenExpires * 24  * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV==='production' ? 'none' : 'lax'
};

export const sendToken = async (user:IUser, statusCode:number, res:Response, next:NextFunction): Promise<void> => {
     // upload user to redis (expires in 7 days)
     redis.set(user._id, JSON.stringify(user), "EX", 604800); // EX: 7 days.
     //create session
     const session = await createSession(user, next) as Session;
    // generate tokens
    const accessToken = user.signAccessToken(session.sessionId);
    const refreshToken = user.signRefreshToken(session.sessionId);
    // token options in production
    if (process.env.NODE_ENV==='production') {
        refreshTokenOptions.secure = true;
        accessTokenOptions.secure = true;
    };
    // set the cookies in the headers
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    // send the cookies to client
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    })
}