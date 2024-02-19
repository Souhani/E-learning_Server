"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = (0, express_1.Router)();
// get all notifications --valid only for admin
notificationRouter.get('/get-all-notifications', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), notification_controller_1.getAllNotifications);
// update notification staus --valid only for admin
notificationRouter.put('/update-notification/:id', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), notification_controller_1.updateNotification);
exports.default = notificationRouter;
