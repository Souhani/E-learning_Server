"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.getQuizzes = exports.getQuiz = exports.createQuiz = void 0;
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const mongoose_1 = __importDefault(require("mongoose"));
// create the quiz in the database
const createQuiz = async (data, res, next) => {
    try {
        // create Quiz
        const quiz = await quiz_model_1.default.create(data);
        res.status(201).json({
            success: true,
            quiz
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error
            ? err.message
            : "Error Creating Quiz: Internal Server Error";
        return next(new ErrorHandler_1.default(errorMessage, 500));
    }
};
exports.createQuiz = createQuiz;
// get quiz from the database by its course_id
const getQuiz = async (course_id, res, next) => {
    try {
        // check if the id is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(course_id)) {
            return next(new ErrorHandler_1.default("Invalid Course ID", 400));
        }
        // get Quiz
        const quiz = await quiz_model_1.default.find({ course_id });
        // in case quiz does not exist
        if (!quiz.length) {
            return next(new ErrorHandler_1.default("Quiz not found!", 404));
        }
        ;
        //send response to client
        res.status(201).json({
            success: true,
            quiz
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error
            ? err.message
            : "Error Getting Quiz: Internal Server Error";
        return next(new ErrorHandler_1.default(errorMessage, 500));
    }
};
exports.getQuiz = getQuiz;
// get all quizzes from the database
const getQuizzes = async (res, next) => {
    try {
        // get all Quizzes
        const quizzes = await quiz_model_1.default.find().sort({
            createdAt: -1
        });
        //send response to client
        res.status(201).json({
            success: true,
            quizzes
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error
            ? err.message
            : "Error Getting Quizzes: Internal Server Error";
        return next(new ErrorHandler_1.default(errorMessage, 500));
    }
};
exports.getQuizzes = getQuizzes;
//delete a quiz
const deleteQuiz = async (quiz_id, res, next) => {
    try {
        // check if the id is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(quiz_id)) {
            return next(new ErrorHandler_1.default("Invalid quiz ID", 400));
        }
        // delete the quiz 
        await quiz_model_1.default.findByIdAndDelete(quiz_id);
        res.status(201).json({
            success: true,
            message: "Quiz deleted successfully"
        });
    }
    catch (err) {
        const errorMessage = err instanceof Error
            ? err.message
            : "Error Deleting Quiz: Internal Server Error";
        return next(new ErrorHandler_1.default(errorMessage, 500));
    }
};
exports.deleteQuiz = deleteQuiz;
