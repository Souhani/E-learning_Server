"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config();
const dbURL = process.env.DB_URL || '';
const connectDb = async () => {
    try {
        await mongoose_1.default.connect(dbURL)
            .then((data) => {
            console.log(`Database connected with ${data.connection.host}`);
        });
    }
    catch (error) {
        console.log('error while connnecting to the database: ', error.message);
        setTimeout(connectDb, 5000);
    }
};
exports.default = connectDb;
