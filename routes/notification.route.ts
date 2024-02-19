import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getAllNotifications, updateNotification } from "../controllers/notification.controller";

const notificationRouter = Router();

// get all notifications --valid only for admin
notificationRouter.get('/get-all-notifications', isAuthenticated, authorizeRoles("Admin"), getAllNotifications);

// update notification staus --valid only for admin
notificationRouter.put('/update-notification/:id', isAuthenticated, authorizeRoles("Admin"), updateNotification);

export default notificationRouter;