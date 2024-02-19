import { NextFunction, Request } from "express";
import { IUser } from "../models/user.model";
import { redis } from "../utils/redis";
import ErrorHandler from "./ErrorHandler";

export type Session = {
    sessionId:string;
     userId:string;
     valid:boolean;
}
export const createSession = async (user:IUser, next:NextFunction) : Promise<Session | void> => {
    try {
        let sessionId ="";
        let seassionIdExist = true;
        let count = 1;
        while(seassionIdExist) {
            sessionId = "session_"+(await redis.dbsize() + count).toString();
            const isSession = await redis.get(sessionId);
            if(!isSession) {
                seassionIdExist = false;
            } else {
                count++;
            }
        }
        const session:Session = {sessionId, userId:user._id, valid:true};
        redis.set(sessionId, JSON.stringify(session), "EX", 2629800); // EX:1Month.
        return session;
    } catch(error) {
        return next(new ErrorHandler("error creating session", 400));
    }
}