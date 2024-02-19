"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
const error_1 = __importDefault(require("./middleware/error"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const layout_route_1 = __importDefault(require("./routes/layout.route"));
// create our express server
exports.app = (0, express_1.default)();
//use the cors middleware: Cross-origin resource sharing (CORS)
//is a mechanism that allows restricted resources on a web page
//to be accessed from another domain outside the domain from which
//the first resource was served.
exports.app.use((0, cors_1.default)({ origin: ['http://localhost:3000'],
    credentials: true }));
// body parser wih the limit for the JSON payload size. the maximum size 50 megabytes.
exports.app.use(express_1.default.json({ limit: "50mb" }));
//cookieParser: Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
exports.app.use((0, cookie_parser_1.default)());
// routes
exports.app.use('/api/v1', user_route_1.default, course_route_1.default, order_route_1.default, notification_route_1.default, analytics_route_1.default, layout_route_1.default);
//testing our API
exports.app.get("/testing", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});
// unknown routes
exports.app.all("*", (req, res, next) => {
    const err = new Error(`route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
// handling errors
exports.app.use(error_1.default);
// limit the reqs (to protced the serever from many reqs)
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Use an external store for consistency across multiple server instances.
});
// Apply the rate limiting middleware to all requests.
exports.app.use(limiter);
