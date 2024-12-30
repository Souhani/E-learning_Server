"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
;
;
;
const faqSchema = new mongoose_1.Schema({
    question: String,
    answer: String
});
const categorySchema = new mongoose_1.Schema({
    title: String
});
const bannerImageSchema = new mongoose_1.Schema({
    public_id: String,
    url: String
});
const layoutSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true
    },
    faq: {
        type: [faqSchema]
    },
    categories: {
        type: [categorySchema]
    },
    banner: {
        type: {
            image: bannerImageSchema,
            title: String,
            subTitle: String
        }
    }
});
const layoutModel = (0, mongoose_1.model)("Layout", layoutSchema);
exports.default = layoutModel;
