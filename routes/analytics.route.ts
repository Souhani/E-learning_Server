import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";

const analyticsRouter = Router();

// admin route to get the users analytics
analyticsRouter.get("/get-users-analytics", isAuthenticated, authorizeRoles("Admin"), getUsersAnalytics);

// admin route to get the courses analytics
analyticsRouter.get("/get-courses-analytics", isAuthenticated, authorizeRoles("Admin"), getCoursesAnalytics);

// admin route to get the orders analytics
analyticsRouter.get("/get-orders-analytics", isAuthenticated, authorizeRoles("Admin"), getOrdersAnalytics);

export default analyticsRouter;