import mongoose, {Document, Model, Schema} from "mongoose";

export interface IOption extends Document {
    option: string;
    is_correct: boolean;
};

export interface IQuestion extends Document {
    question: string;
    time: number;
    options: IOption[];
};

export interface IQuiz extends Document {
    title: string;
    course_id: mongoose.Schema.Types.ObjectId;
    quiz: IQuestion[];
};

const optionSchema = new Schema<IOption>({
    option: {
        type: String,
        required: [true, 'option is required']
    },
    is_correct: {
        type: Boolean,
        required: [true, 'is_correct is required']
    }
});

const questionSchema = new Schema<IQuestion>({
    question: {
        type: String,
        required: [true, 'question is required']
    },
    time: {
        type: Number,
        required: [true, 'time is required']
    },
    options: {
        type: [optionSchema],
        required: [true, 'options are required']
    }
});

const quizSchema = new Schema<IQuiz>({
    title: {
        type: String,
        required: [true, 'quiz title is required']
    },
    quiz: {
        type: [questionSchema],
        required: [true, 'quiz is required']
    },
    course_id: {
         type: mongoose.Types.ObjectId,
         ref: "Course",
        required: [true, 'course_id is required']
    }
}, { timestamps: true });

const quizModel: Model<IQuiz> = mongoose.model('Quiz', quizSchema);

export default quizModel;
