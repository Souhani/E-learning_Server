import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayout } from "../controllers/layout.controllers";

const layoutRouter = Router();

// Create layout only for admin
layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("Admin"), createLayout);

// Edit layout only for admin
layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("Admin"), editLayout);

// get layout for everyone
layoutRouter.get("/get-layout/:type", getLayout);


export default layoutRouter;