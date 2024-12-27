import { NextFunction, Response } from "express";
import quizModel, { IQuiz } from "../models/quiz.model";
import ErrorHandler from "../utils/ErrorHandler";
import mongoose from "mongoose";


// create the quiz in the database
export const createQuiz = async (data:IQuiz, res:Response, next:NextFunction) => {
    try {
        // create Quiz
        const quiz = await quizModel.create(data);
        res.status(201).json({
            success: true,
            quiz
        });
    } catch(err:unknown) {
        const errorMessage =
        err instanceof Error
            ? err.message
            : "Error Creating Quiz: Internal Server Error";
        return next(new ErrorHandler(errorMessage, 500));
    }
}


// get quiz from the database by its course_id
export const getQuiz = async (course_id:string, res:Response, next:NextFunction) => {
    try {
         // check if the id is valid
         if (!mongoose.Types.ObjectId.isValid(course_id)) {
            return next(new ErrorHandler("Invalid Course ID", 400));
        }
        // get Quiz
        const quiz = await quizModel.find({course_id});
        
        // in case quiz does not exist
        if(!quiz.length) {
           return next(new ErrorHandler("Quiz not found!", 404));
        };

        //send response to client
        res.status(201).json({
            success: true,
            quiz
        });

    } catch(err:unknown) {
        const errorMessage =
        err instanceof Error
            ? err.message
            : "Error Getting Quiz: Internal Server Error";
        return next(new ErrorHandler(errorMessage, 500));
    }
}

// get all quizzes from the database
export const getQuizzes = async (res:Response, next:NextFunction) => {
    try {
        // get all Quizzes
        const quizzes = await quizModel.find().sort({
            createdAt: -1
          });
        
        //send response to client
        res.status(201).json({
            success: true,
            quizzes
        });

    } catch(err:unknown) {
        const errorMessage =
        err instanceof Error
            ? err.message
            : "Error Getting Quizzes: Internal Server Error";
        return next(new ErrorHandler(errorMessage, 500));
    }
}


//delete a quiz
export const deleteQuiz = async (quiz_id:string, res:Response,  next:NextFunction) => {
    try { 
        // check if the id is valid
        if (!mongoose.Types.ObjectId.isValid(quiz_id)) {
            return next(new ErrorHandler("Invalid quiz ID", 400));
        }
        // delete the quiz 
        await quizModel.findByIdAndDelete(quiz_id);    

         res.status(201).json({
            success: true,
            message: "Quiz deleted successfully"
        });

    } catch(err:unknown) {
        const errorMessage =
        err instanceof Error
            ? err.message
            : "Error Deleting Quiz: Internal Server Error";
        return next(new ErrorHandler(errorMessage, 500));
    }
}