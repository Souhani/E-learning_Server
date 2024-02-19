import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllAdminCoursesService } from "../services/course.service";
import courseModel from "../models/course.model";
import mongoose from "mongoose";
import sendMail from "../utils/sendMail";
import notificationModel from "../models/notification.model";
import axios from "axios";

// upload course
export const uploadCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloudThumbnail = await cloudinary.v2.uploader.upload(
          thumbnail,
          {
            folder: "courses",
          }
        );
        data.thumbnail = {
          public_id: myCloudThumbnail.public_id,
          url: myCloudThumbnail.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// edit course
export const editCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      const courseId = req.params.id;
      const originCourse = await courseModel.findById(courseId);
      if (!originCourse) {
        return next(new ErrorHandler("Course id is not provided", 500));
      };
      if(thumbnail) {
        if(!thumbnail.startsWith("http")) {
          const public_id = originCourse?.thumbnail?.public_id;
          if(public_id) {
            await cloudinary.v2.uploader.destroy(public_id);
          };
          const myCloudThumbnail = await cloudinary.v2.uploader.upload(
            thumbnail,
            {
              folder: "courses",
            }
          );
          data.thumbnail = {
            public_id: myCloudThumbnail.public_id,
            url: myCloudThumbnail.secure_url,
          };
      } else {
        data.thumbnail = originCourse?.thumbnail;
      }
      }
      const course = await courseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      // update cache (signle course and all courses withoout purchaseing) with the new course update.
      const updatedCourse = await courseModel
        .findById(courseId)
        .select(
          "-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions"
        );
      // update all courses
      const allCourses = await courseModel
        .find()
        .select(
          "-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions"
        );
      // send the new updates
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get single course --without purchasing;
export const getSingleCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id as string;
      let course;
      if (!courseId) {
        return next(new ErrorHandler("the course id is not provided", 500));
      }
     
        course = await courseModel
          .findById(courseId)
          .select(
            "-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions"
          );
        if (!course) {
          return next(new ErrorHandler("could not find the course", 500));
        }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses --without purchasing;
export const getAllCourses = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let allCourses;

        allCourses = await courseModel
          .find()
          .select(
            "-courseData.videoUrl -courseData.links -courseData.suggestion -courseData.questions"
          );
      res.status(200).json({
        success: true,
        allCourses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get purchased course content only for valid user;
export const getCourseByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const course = await courseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        sucess: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add question in course only for valid user
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const user = req.user;
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const course = await courseModel.findById(courseId);
      const content = course?.courseData?.find((content: any) =>
        content._id.equals(contentId)
      );
      if (!content) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const newQuestion: any = {
        user,
        question,
        questionReplies: [],
      };
      // add question to the course content
      content.questions.push(newQuestion);
      // save new updates
      await course?.save();
      // create admin question notification
      await notificationModel.create({
        title: "New Question",
        message: `a new Question in the course: ${course?.name}, Section: ${content.title}.`,
        userId: user?._id
      });
      // response with the new updates
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add answers in course only for valid user
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const user = req.user;
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const course = await courseModel.findById(courseId);
      const content = course?.courseData?.find((content: any) =>
        content._id.equals(contentId)
      );
      if (!content) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return next(new ErrorHandler("Invalid question id", 400));
      }
      const questionContent = content?.questions?.find((question: any) =>
        question._id.equals(questionId)
      );
      if (!questionContent) {
        return next(new ErrorHandler("Invalid question id", 400));
      }
      const newAnswer: any = {
        user,
        reply:answer,
      };
      questionContent?.questionReplies.push(newAnswer);
      await course?.save();
      if (user?.role !== "Admin") {
        //notification
        await notificationModel.create({
          title: "New Question Reply",
          message: `a new question reply in the course: ${course?.name}, Section: ${content.title}.`,
          userId: user?._id
        });
      } else {
        // user reply on email
        const data = {
          name: questionContent?.user?.name,
          question: questionContent?.question,
          courseName: course?.name,
        };
        const emailOpionts: any = {
          email: questionContent?.user?.email,
          template: "question-reply.ejs",
          subject: `You've Got a Response to Your Question in ${content.title}`,
          data,
        };
        try {
          await sendMail(emailOpionts);
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add review in course
interface IAddReviwData {
  comment: string;
  rating: number;
}

export const addReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { comment, rating } = req.body as IAddReviwData;
      rating = Math.floor(rating);
      if (!(rating <= 5 && rating >= 1)) {
        return next(
          new ErrorHandler(
            "please give a valid rating to submit your review",
            400
          )
        );
      }
      const courseId = req.params.id;
      const user = req.user;
      const course = await courseModel.findById(courseId);
      if (course) {
        const reviews: any = course.reviews;
        const isUserReviewed = reviews?.some(
          (review: any) => review.user.email === user?.email
        );
        if (isUserReviewed) {
          return next(
            new ErrorHandler("You already reviewed this course", 400)
          );
        }
        const reviewData: any = {
          user,
          rating,
          comment,
        };
        reviews.push(reviewData);
        let ratingSum = 0;
        reviews.forEach((review: any) => {
          ratingSum += review.rating;
        });
        const ratingAverage = ratingSum / reviews.length;
        course.ratings = ratingAverage;
        await course?.save();
        // create review notification for admin
        await notificationModel.create({
          title: "New Review Received",
          message: `${user?.name} has given a review in ${course?.name}`,
          userId: user?._id
        });
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// admin replay to review 
interface IAddReplyToReviewData {
  replyMessage: string;
  reviewId: string;
  courseId: string
}
export const addReplyToReview = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try {
    const { replyMessage, reviewId, courseId } = req.body as IAddReplyToReviewData;
    if(!replyMessage) {
      return next(
        new ErrorHandler("The replay should not be empty", 400)
      );
    };
    if(!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return next(
        new ErrorHandler("Invalid course or review id", 400)
      );
    };
    const course = await courseModel.findById(courseId);
    if(!course) {
      return next(
        new ErrorHandler("Course not found!", 400)
      );
    };
    const reviews:any = course.reviews;
    const userReview = reviews.find((review:any) => reviewId === review._id.toString());
    if(!userReview) {
      return next(
        new ErrorHandler("Review not found!", 400)
      );
    };
    const replayData = {
      user: req?.user,
      reply: replyMessage
    }
    if(!userReview.reviewReplies) {
      userReview.reviewReplies=[];
    }
    userReview.reviewReplies.push(replayData);
    await course.save();
    res.status(200).json({
      success: true,
      course
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  };
});

// get all admin courses (valid only for admin)
export const getAllAdminCourses = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try {
    await getAllAdminCoursesService(res);
  } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
});

// admin delete course 
export const deleteCourse = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try {
    const courseId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(courseId)) {
      return next(new ErrorHandler('course not found', 404));
    };
    const course = await courseModel.findById(courseId);
    if(!course) {
      return next(new ErrorHandler('course not found', 404));
    };
    await course.deleteOne({ courseId });
    res.status(200).json({
      success: true,
      message: "course deleted successfully"
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//generate video url 
export const generateVideoUrl = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try{
    const { videoId } = req.body;
    const response = await axios.post(
      `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
      { ttl: 300},
      {
        headers: {
          Accept: "application/json",
          'sContent-Type': 'application/json',
          Authorization: `Apisecret ${process.env.VDCIPHER_API_SECRET}`
        }
      }
    );
    res.json(response.data);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
})