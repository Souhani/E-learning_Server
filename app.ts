import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from 'express-rate-limit'
import ErrorMiddleware from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import quizRouter from "./routes/quiz.route";

// create our express server
export const app = express();

//use the cors middleware: Cross-origin resource sharing (CORS)
//is a mechanism that allows restricted resources on a web page
//to be accessed from another domain outside the domain from which
//the first resource was served.

//comment for testing
// app.use(cors({ origin: ['https://e-learning-client-quiz.vercel.app'],
//                credentials: true }));

// body parser wih the limit for the JSON payload size. the maximum size 50 megabytes.
app.use(express.json({ limit: "50mb" }));

//cookieParser: Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(cookieParser());

// routes
app.use('/api/v1', userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter, quizRouter);

//testing our API
app.get("/testing", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// handling errors
app.use(ErrorMiddleware);

// limit the reqs (to protced the serever from many reqs)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})
// Apply the rate limiting middleware to all requests.
app.use(limiter);

