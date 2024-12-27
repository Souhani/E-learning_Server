import { Router } from "express";
import { deleteQuizById, getAllQuizzes, getQuizByCourseId, uploadQuiz } from "../controllers/quiz.controller";


const quizRouter = Router();

// create quiz route: (protected Admin route).
quizRouter.post("/create-quiz", uploadQuiz);

// get quiz route
quizRouter.get("/get-quiz/:course_id", getQuizByCourseId);

// get all quizzes route: (protected Admin route).
quizRouter.get("/get-all-quizzes", getAllQuizzes);

// delete quiz route: (protected Admin route).
quizRouter.delete("/delete-quiz/:id", deleteQuizById);


export default quizRouter;