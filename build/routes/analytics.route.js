"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analyticsRouter = (0, express_1.Router)();
// admin route to get the users analytics
analyticsRouter.get("/get-users-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), analytics_controller_1.getUsersAnalytics);
// admin route to get the courses analytics
analyticsRouter.get("/get-courses-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), analytics_controller_1.getCoursesAnalytics);
// admin route to get the orders analytics
analyticsRouter.get("/get-orders-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), analytics_controller_1.getOrdersAnalytics);
exports.default = analyticsRouter;
