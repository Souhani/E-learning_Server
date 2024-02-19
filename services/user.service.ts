import { NextFunction, Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

// get user by id from redis
export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

// get all users from database
export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({
    createdAt: -1
  });
  res.status(201).json({
    success: true,
    users
  })
};

// update user role
export const updateUserRoleService = async (email:string, role:string, res:Response, next:NextFunction) => {
  const user = await userModel.findOneAndUpdate({email}, { role }, {new: true});
  await redis.set(user?._id, JSON.stringify(user), "EX", 604800);
  if(!user) {
    return next(new ErrorHandler('User email not found. please create an account first to update its role', 404));
  }
  res.status(201).json({
    success: true,
    user
  })
}