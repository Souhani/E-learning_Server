import { NextFunction, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import orderModel from "../models/order.model";
import { IOrderData } from "../controllers/order.controller";

export const newOrder = async (data:IOrderData, res:Response, next:NextFunction) => {
    try { 
        return await orderModel.create(data);
    } catch(error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get all orders from database
export const getAllOrdersService = async (res: Response) => {
    const orders = await orderModel.find().sort({
      createdAt: -1
    });
    res.status(201).json({
      success: true,
      orders
    })
  };