"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
require('dotenv').config();
const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis url is provided");
        return process.env.REDIS_URL;
    }
    ;
    throw new Error('Redis url is not provided');
};
exports.redis = new ioredis_1.default(redisClient());
