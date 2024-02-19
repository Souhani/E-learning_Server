import { app } from "./app";
import { initSocketServer } from "./socketServer";
import { connectCloudinary } from "./utils/couldinaryConfig";
import connectDb from "./utils/db";
import http from "http";
require('dotenv').config();

// create server
const server = http.createServer(app);

// connect socket server
initSocketServer(server);

// connect to mongodb database
connectDb();

// connect to cloudinary
 connectCloudinary();
 
 server.listen(process.env.PORT, () => {
    console.log(`server connected with the port: ${process.env.PORT}`);
})