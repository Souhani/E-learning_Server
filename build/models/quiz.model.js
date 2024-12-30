"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
;
;
;
const optionSchema = new mongoose_1.Schema({
    option: {
        type: String,
        required: [true, 'option is required']
    },
    is_correct: {
        type: Boolean,
        required: [true, 'is_correct is required']
    }
});
const questionSchema = new mongoose_1.Schema({
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
const quizSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'quiz title is required']
    },
    quiz: {
        type: [questionSchema],
        required: [true, 'quiz is required']
    },
    course_id: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Course",
        required: [true, 'course_id is required']
    }
}, { timestamps: true });
const quizModel = mongoose_1.default.model('Quiz', quizSchema);
exports.default = quizModel;
