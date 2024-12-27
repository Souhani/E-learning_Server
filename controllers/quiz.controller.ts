import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import { createQuiz, deleteQuiz, getQuiz, getQuizzes } from "../services/quiz.service";
import { IQuiz } from "../models/quiz.model";

// upload quiz
export const uploadQuiz = catchAsyncErrors(
    async (req:Request, res:Response, next:NextFunction) => {
      const data = req.body as IQuiz;
      await createQuiz(data, res, next);
    }
);

//get a singl quiz by its course_id
export const getQuizByCourseId = catchAsyncErrors(
    async (req:Request, res:Response, next:NextFunction) => {
        const course_id:string = req.params.course_id
        await getQuiz(course_id, res, next);
    }
);

//get a all  quizzes
export const getAllQuizzes = catchAsyncErrors(
    async (req:Request, res:Response, next:NextFunction) => {
        await getQuizzes(res, next);
    }
);

// admin delete quiz 
export const deleteQuizById = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
      const quizId = req.params.id as string  ;
      await deleteQuiz(quizId, res, next);
  });