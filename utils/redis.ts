import Redis from "ioredis";
require('dotenv').config();

const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log("Redis url is provided");
        return process.env.REDIS_URL
    };
    throw new Error('Redis url is not provided')
};

export const redis = new Redis(redisClient());
