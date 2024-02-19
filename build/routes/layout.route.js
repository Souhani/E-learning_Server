"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const layout_controllers_1 = require("../controllers/layout.controllers");
const layoutRouter = (0, express_1.Router)();
// Create layout only for admin
layoutRouter.post("/create-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), layout_controllers_1.createLayout);
// Edit layout only for admin
layoutRouter.put("/edit-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), layout_controllers_1.editLayout);
// get layout for everyone
layoutRouter.get("/get-layout/:type", layout_controllers_1.getLayout);
exports.default = layoutRouter;
