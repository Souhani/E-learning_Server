import {  Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import courseModel from "../models/course.model";

//create course in the database 
export const createCourse = catchAsyncErrors(async (data:any, res:Response) => {
  // create course
  const course = await courseModel.create(data);
  res.status(201).json({
    success: true,
    course
  })
});

// get all admin Courses from database
export const getAllAdminCoursesService = async (res: Response) => {
  const courses = await courseModel.find().sort({
    createdAt: -1
  });
  res.status(201).json({
    success: true,
    courses
  })
};

