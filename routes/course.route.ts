import { Router } from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAllAdminCourses,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated, isUserEligibleToCourse } from "../middleware/auth";

const courseRouter = Router();

// create and edit course (protected Admin routes).
courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("Admin"),
  uploadCourse
);
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  editCourse
);

// get single and all couses without purchasing (not protected routes).
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);

// get single course content only for valid user (purschased courses).
courseRouter.get("/get-course-content/:id", isAuthenticated, isUserEligibleToCourse, getCourseByUser);

// add question in the course only for valid user (purschased courses).
courseRouter.put("/add-question", isAuthenticated, isUserEligibleToCourse, addQuestion);

// add answer in the course only for valid user (purschased courses).
courseRouter.put("/add-answer", isAuthenticated, isUserEligibleToCourse, addAnswer);

// add review in the course only for valid user (purschased courses).
courseRouter.put("/add-review/:id", isAuthenticated, isUserEligibleToCourse, addReview);

// add review replay from the admin (protected Admin route).
courseRouter.put("/reply-review", isAuthenticated, authorizeRoles("Admin"), addReplyToReview);

// get all admin courses (protected Admin route).
courseRouter.get("/get-admin-courses", isAuthenticated, authorizeRoles("Admin"), getAllAdminCourses);

// delete course (protected Admin route).
courseRouter.delete("/delete-course/:id", isAuthenticated, authorizeRoles("Admin"), deleteCourse);

// get video url generateVideoUrl
courseRouter.post("/generate-video-url", generateVideoUrl);

export default courseRouter;
