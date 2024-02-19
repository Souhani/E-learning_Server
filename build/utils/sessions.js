"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = void 0;
const redis_1 = require("../utils/redis");
const ErrorHandler_1 = __importDefault(require("./ErrorHandler"));
const createSession = async (user, next) => {
    try {
        let sessionId = "";
        let seassionIdExist = true;
        let count = 1;
        while (seassionIdExist) {
            sessionId = "session_" + (await redis_1.redis.dbsize() + count).toString();
            const isSession = await redis_1.redis.get(sessionId);
            if (!isSession) {
                seassionIdExist = false;
            }
            else {
                count++;
            }
        }
        const session = { sessionId, userId: user._id, valid: true };
        redis_1.redis.set(sessionId, JSON.stringify(session), "EX", 2629800); // EX:1Month.
        return session;
    }
    catch (error) {
        return next(new ErrorHandler_1.default("error creating session", 400));
    }
};
exports.createSession = createSession;
