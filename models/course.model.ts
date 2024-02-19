import mongoose, {Document, Model, Schema} from "mongoose";
import { IUser } from "./user.model";

export interface IQuestionReplies extends Document {
    user: IUser,
    reply: string;
};

export interface IReviewReply extends Document {
    user: IUser,
    reply: string;
};

export interface IQuestion extends Document {
    user: IUser,
    question: string;
    questionReplies: IQuestionReplies[];
};

export interface IReview extends Document {
    user: IUser;
    rating: number;
    comment: string;
    reviewReplies?: [IReviewReply];
};

interface ILink extends Document {
    title: string;
    url: string;
};

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IQuestion[];
};

interface ICourse extends Document {
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    public_id: string;
    url: string;
    };
  tags: string;
  category: string;
  level: string;
  videoPlayer: string;
  demoUrl: string;
  benefits: {title: string}[];
  prerequisites: {title: string}[];
  reviews: IReview;
  courseData: ICourseData[];
  ratings?: number;
  purchased?: number;
};

const questionRepliesSchema = new Schema<IQuestionReplies>({
    user: Object,
    reply: String,
  },{timestamps:true});

const questionSchema = new Schema<IQuestion>({
  user: Object,
  question: String,
  questionReplies: [questionRepliesSchema]
},{timestamps:true});

const reviewReplySchema = new Schema<IReviewReply>({
    user: Object,
    reply: String,
  },{timestamps:true});

const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
    reviewReplies: [reviewReplySchema]
},{timestamps:true});

const linkSchema = new Schema<ILink>({
  title: String,
  url: String
});

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [questionSchema]
});

const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: {
        type: Number
    },
    thumbnail: {
        public_id: {
            type: String        },
        url: {
            type: String        }
    },
    tags: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    videoPlayer: {
        type:String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews : [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const courseModel: Model<ICourse> = mongoose.model('Course', courseSchema);

export default courseModel;