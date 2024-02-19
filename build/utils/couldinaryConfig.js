"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.CLOUD_API_KEY;
const api_secret = process.env.CLOUD_SECRET_KEY;
const connectCloudinary = () => {
    if (cloud_name && api_key && api_secret) {
        console.log("cloudinary info are provided");
        cloudinary_1.v2.config({
            cloud_name,
            api_key,
            api_secret,
        });
    }
    else {
        throw new Error("cloudinary info are not provided");
    }
};
exports.connectCloudinary = connectCloudinary;
