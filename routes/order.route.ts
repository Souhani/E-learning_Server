import { Router } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders, newPayment, sendStripePublishableKey } from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);
orderRouter.get("/get-admin-orders", isAuthenticated, authorizeRoles("Admin"), getAllOrders);
orderRouter.get("/payment/stripe_publishable_key", sendStripePublishableKey);
orderRouter.post("/payment",  newPayment);

export default orderRouter;