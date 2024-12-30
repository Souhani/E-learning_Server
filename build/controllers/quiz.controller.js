"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuizById = exports.getAllQuizzes = exports.getQuizByCourseId = exports.uploadQuiz = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const quiz_service_1 = require("../services/quiz.service");
// upload quiz
exports.uploadQuiz = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const data = req.body;
    await (0, quiz_service_1.createQuiz)(data, res, next);
});
//get a singl quiz by its course_id
exports.getQuizByCourseId = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const course_id = req.params.course_id;
    await (0, quiz_service_1.getQuiz)(course_id, res, next);
});
//get a all  quizzes
exports.getAllQuizzes = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    await (0, quiz_service_1.getQuizzes)(res, next);
});
// admin delete quiz 
exports.deleteQuizById = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    const quizId = req.params.id;
    await (0, quiz_service_1.deleteQuiz)(quizId, res, next);
});
