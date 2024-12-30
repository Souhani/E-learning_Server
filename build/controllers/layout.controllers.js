"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayout = exports.editLayout = exports.createLayout = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
// Create layout only for admin
exports.createLayout = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!type) {
            return next(new ErrorHandler_1.default("The type of layout is required", 400));
        }
        const isTypeExist = await layout_model_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new ErrorHandler_1.default(`${type} already exist`, 400));
        }
        ;
        // banner 
        if (type === "BANNER") {
            const { image, title, subTitle } = req.body;
            if (!image) {
                return next(new ErrorHandler_1.default("Banner image is required.", 400));
            }
            const myImageCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "banner",
            });
            const banner = {
                image: {
                    public_id: myImageCloud.public_id,
                    url: myImageCloud.secure_url
                },
                title,
                subTitle
            };
            await layout_model_1.default.create({ type: "BANNER", banner });
        }
        ;
        // faq 
        if (type === "FAQ") {
            const { faq } = req.body;
            await layout_model_1.default.create({ type: "FAQ", faq });
        }
        ;
        // categories 
        if (type === "CATEGORIES") {
            const { categories } = req.body;
            await layout_model_1.default.create({ type: "CATEGORIES", categories });
        }
        ;
        res.status(200).json({
            success: true,
            message: "layout created successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.messagem, 500));
    }
});
// Edit layout only for admin
exports.editLayout = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!type) {
            return next(new ErrorHandler_1.default("The type of layout is required", 400));
        }
        const layout = await layout_model_1.default.findOne({ type });
        if (!layout) {
            return next(new ErrorHandler_1.default(`${type} not exist`, 400));
        }
        ;
        // banner 
        if (type === "BANNER") {
            const { image, title, subTitle } = req.body;
            const bannerLayout = layout;
            const oldBannerImagePublic_id = bannerLayout?.banner.image.public_id;
            const oldBannerImageUrl = bannerLayout?.banner.image.url;
            let newImage;
            if (!image.startsWith("http")) {
                await cloudinary_1.default.v2.uploader.destroy(oldBannerImagePublic_id);
                const myImageCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "banner",
                });
                newImage = {
                    public_id: myImageCloud.public_id,
                    url: myImageCloud.secure_url
                };
            }
            else {
                newImage = {
                    public_id: oldBannerImagePublic_id,
                    url: oldBannerImageUrl
                };
            }
            const banner = {
                image: newImage,
                title,
                subTitle
            };
            bannerLayout.banner = banner;
            await bannerLayout?.save();
        }
        ;
        // faq 
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqLayout = layout;
            faqLayout.faq = faq.map((q) => ({ question: q.question,
                answer: q.answer
            }));
            await faqLayout.save();
        }
        ;
        // categories 
        if (type === "CATEGORIES") {
            const { categories } = req.body;
            const categoriesLayout = layout;
            categoriesLayout.categories = categories.map((c) => ({ title: c.title }));
            await categoriesLayout.save();
        }
        ;
        res.status(200).json({
            success: true,
            message: "layout updated successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.messagem, 500));
    }
});
// get layout
exports.getLayout = (0, catchAsyncErrors_1.catchAsyncErrors)(async (req, res, next) => {
    try {
        const { type } = req.params;
        if (!type) {
            return next(new ErrorHandler_1.default("The type of layout is required", 400));
        }
        ;
        const layout = await layout_model_1.default.findOne({ type });
        if (!layout) {
            return next(new ErrorHandler_1.default(`${type} not found`, 404));
        }
        ;
        res.status(200).json({
            success: true,
            layout
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.messagem, 500));
    }
});
