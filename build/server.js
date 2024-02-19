"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const socketServer_1 = require("./socketServer");
const couldinaryConfig_1 = require("./utils/couldinaryConfig");
const db_1 = __importDefault(require("./utils/db"));
const http_1 = __importDefault(require("http"));
require('dotenv').config();
// create server
const server = http_1.default.createServer(app_1.app);
// connect socket server
(0, socketServer_1.initSocketServer)(server);
// connect to mongodb database
(0, db_1.default)();
// connect to cloudinary
(0, couldinaryConfig_1.connectCloudinary)();
server.listen(process.env.PORT, () => {
    console.log(`server connected with the port: ${process.env.PORT}`);
});
