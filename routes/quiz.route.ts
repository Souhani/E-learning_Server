import { Router } from "express";
import { deleteQuizById, getAllQuizzes, getQuizByCourseId, uploadQuiz } from "../controllers/quiz.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";


const quizRouter = Router();

// create quiz route: (protected Admin route).
quizRouter.post("/create-quiz", isAuthenticated, authorizeRoles("Admin"), uploadQuiz);

// get quiz route
quizRouter.get("/get-quiz/:course_id", isAuthenticated, getQuizByCourseId);

// get all quizzes route: (protected Admin route).
quizRouter.get("/get-all-quizzes", isAuthenticated, authorizeRoles("Admin"),  getAllQuizzes);

// delete quiz route: (protected Admin route).
quizRouter.delete("/delete-quiz/:id",isAuthenticated, authorizeRoles("Admin"),  deleteQuizById);


export default quizRouter;