"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_1 = require("../middleware/auth");
const courseRouter = (0, express_1.Router)();
// create and edit course (protected Admin routes).
courseRouter.post("/create-course", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), course_controller_1.uploadCourse);
courseRouter.put("/edit-course/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), course_controller_1.editCourse);
// get single and all couses without purchasing (not protected routes).
courseRouter.get("/get-course/:id", course_controller_1.getSingleCourse);
courseRouter.get("/get-courses", course_controller_1.getAllCourses);
// get single course content only for valid user (purschased courses).
courseRouter.get("/get-course-content/:id", auth_1.isAuthenticated, auth_1.isUserEligibleToCourse, course_controller_1.getCourseByUser);
// add question in the course only for valid user (purschased courses).
courseRouter.put("/add-question", auth_1.isAuthenticated, auth_1.isUserEligibleToCourse, course_controller_1.addQuestion);
// add answer in the course only for valid user (purschased courses).
courseRouter.put("/add-answer", auth_1.isAuthenticated, auth_1.isUserEligibleToCourse, course_controller_1.addAnswer);
// add review in the course only for valid user (purschased courses).
courseRouter.put("/add-review/:id", auth_1.isAuthenticated, auth_1.isUserEligibleToCourse, course_controller_1.addReview);
// add review replay from the admin (protected Admin route).
courseRouter.put("/reply-review", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), course_controller_1.addReplyToReview);
// get all admin courses (protected Admin route).
courseRouter.get("/get-admin-courses", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), course_controller_1.getAllAdminCourses);
// delete course (protected Admin route).
courseRouter.delete("/delete-course/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("Admin"), course_controller_1.deleteCourse);
// get video url generateVideoUrl
courseRouter.post("/generate-video-url", course_controller_1.generateVideoUrl);
exports.default = courseRouter;
