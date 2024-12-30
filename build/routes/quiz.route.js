"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const auth_1 = require("../middleware/auth");
const quizRouter = (0, express_1.Router)();
// create quiz route: (protected Admin route).
quizRouter.post("/create-quiz", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), quiz_controller_1.uploadQuiz);
// get quiz route
quizRouter.get("/get-quiz/:course_id", auth_1.isAuthenticated, quiz_controller_1.getQuizByCourseId);
// get all quizzes route: (protected Admin route).
quizRouter.get("/get-all-quizzes", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), quiz_controller_1.getAllQuizzes);
// delete quiz route: (protected Admin route).
quizRouter.delete("/delete-quiz/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), quiz_controller_1.deleteQuizById);
exports.default = quizRouter;
