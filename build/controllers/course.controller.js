"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllAdminCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../models/course.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const axios_1 = __importDefault(require("axios"));
// upload course
exports.uploadCourse = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloudThumbnail = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloudThumbnail.public_id,
                url: myCloudThumbnail.secure_url,
            };
        }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// edit course
exports.editCourse = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const originCourse = await course_model_1.default.findById(courseId);
        if (!originCourse) {
            return next(new ErrorHandler_1.default("Course id is not provided", 500));
        }
        ;
        if (thumbnail) {
            if (!thumbnail.startsWith("http")) {
                const public_id = originCourse?.thumbnail?.public_id;
                if (public_id) {
                    await cloudinary_1.default.v2.uploader.destroy(public_id);
                }
                ;
                const myCloudThumbnail = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });
                data.thumbnail = {
                    public_id: myCloudThumbnail.public_id,
                    url: myCloudThumbnail.secure_url,
                };
            }
            else {
                data.thumbnail = originCourse?.thumbnail;
            }
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, { $set: data }, { new: true });
        // update cache (signle course and all courses withoout purchaseing) with the new course update.
        const updatedCourse = await course_model_1.default
            .findById(courseId)
            .select("-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions");
        // update all courses
        const allCourses = await course_model_1.default
            .find()
            .select("-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions");
        // send the new updates
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get single course --without purchasing;
exports.getSingleCourse = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        let course;
        if (!courseId) {
            return next(new ErrorHandler_1.default("the course id is not provided", 500));
        }
        course = await course_model_1.default
            .findById(courseId)
            .select("-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions");
        if (!course) {
            return next(new ErrorHandler_1.default("could not find the course", 500));
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all courses --without purchasing;
exports.getAllCourses = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        let allCourses;
        allCourses = await course_model_1.default
            .find()
            .select("-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions");
        res.status(200).json({
            success: true,
            allCourses,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get purchased course content only for valid user;
exports.getCourseByUser = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData;
        res.status(200).json({
            sucess: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData?.find((content) => content._id.equals(contentId));
        if (!content) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const newQuestion = {
            user,
            question,
            questionReplies: [],
        };
        // add question to the course content
        content.questions.push(newQuestion);
        // save new updates
        await course?.save();
        // create admin question notification
        await notification_model_1.default.create({
            title: "New Question",
            message: `a new Question in the course: ${course?.name}, Section: ${content.title}.`,
            userId: user?._id
        });
        // response with the new updates
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        const content = course?.courseData?.find((content) => content._id.equals(contentId));
        if (!content) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(questionId)) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        const questionContent = content?.questions?.find((question) => question._id.equals(questionId));
        if (!questionContent) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        const newAnswer = {
            user,
            reply: answer,
        };
        questionContent?.questionReplies.push(newAnswer);
        await course?.save();
        if (user?.role !== "Admin") {
            //notification
            await notification_model_1.default.create({
                title: "New Question Reply",
                message: `a new question reply in the course: ${course?.name}, Section: ${content.title}.`,
                userId: user?._id
            });
        }
        else {
            // user reply on email
            const data = {
                name: questionContent?.user?.name,
                question: questionContent?.question,
                courseName: course?.name,
            };
            const emailOpionts = {
                email: questionContent?.user?.email,
                template: "question-reply.ejs",
                subject: `You've Got a Response to Your Question in ${content.title}`,
                data,
            };
            try {
                await (0, sendMail_1.default)(emailOpionts);
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        let { comment, rating } = req.body;
        rating = Math.floor(rating);
        if (!(rating <= 5 && rating >= 1)) {
            return next(new ErrorHandler_1.default("please give a valid rating to submit your review", 400));
        }
        const courseId = req.params.id;
        const user = req.user;
        const course = await course_model_1.default.findById(courseId);
        if (course) {
            const reviews = course.reviews;
            const isUserReviewed = reviews?.some((review) => review.user.email === user?.email);
            if (isUserReviewed) {
                return next(new ErrorHandler_1.default("You already reviewed this course", 400));
            }
            const reviewData = {
                user,
                rating,
                comment,
            };
            reviews.push(reviewData);
            let ratingSum = 0;
            reviews.forEach((review) => {
                ratingSum += review.rating;
            });
            const ratingAverage = ratingSum / reviews.length;
            course.ratings = ratingAverage;
            await course?.save();
            // create review notification for admin
            await notification_model_1.default.create({
                title: "New Review Received",
                message: `${user?.name} has given a review in ${course?.name}`,
                userId: user?._id
            });
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { replyMessage, reviewId, courseId } = req.body;
        if (!replyMessage) {
            return next(new ErrorHandler_1.default("The replay should not be empty", 400));
        }
        ;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId) || !mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
            return next(new ErrorHandler_1.default("Invalid course or review id", 400));
        }
        ;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found!", 400));
        }
        ;
        const reviews = course.reviews;
        const userReview = reviews.find((review) => reviewId === review._id.toString());
        if (!userReview) {
            return next(new ErrorHandler_1.default("Review not found!", 400));
        }
        ;
        const replayData = {
            user: req?.user,
            reply: replyMessage
        };
        if (!userReview.reviewReplies) {
            userReview.reviewReplies = [];
        }
        userReview.reviewReplies.push(replayData);
        await course.save();
        res.status(200).json({
            success: true,
            course
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
    ;
});
// get all admin courses (valid only for admin)
exports.getAllAdminCourses = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        await (0, course_service_1.getAllAdminCoursesService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// admin delete course 
exports.deleteCourse = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler_1.default('course not found', 404));
        }
        ;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default('course not found', 404));
        }
        ;
        await course.deleteOne({ courseId });
        res.status(200).json({
            success: true,
            message: "course deleted successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//generate video url 
exports.generateVideoUrl = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                'sContent-Type': 'application/json',
                Authorization: `Apisecret ${process.env.VDCIPHER_API_SECRET}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
