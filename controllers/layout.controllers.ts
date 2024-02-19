import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import layoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// Create layout only for admin
export const createLayout = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const { type } = req.body;
        if(!type) {
            return next(new ErrorHandler("The type of layout is required", 400));  
        }
        const isTypeExist = await layoutModel.findOne({ type });
        if(isTypeExist) {
            return next(new ErrorHandler(`${type} already exist`, 400));
        };

        // banner 
        if(type === "BANNER") {
            const {image, title, subTitle} = req.body;
            if(!image) {
                return next(new ErrorHandler("Banner image is required.", 400));
            }
            const myImageCloud = await cloudinary.v2.uploader.upload(image, {
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
            await layoutModel.create({ type:"BANNER", banner }) 
        };
        // faq 
        if(type === "FAQ") {
         const { faq } = req.body;
         await layoutModel.create({ type:"FAQ", faq });
        };
        // categories 
        if(type === "CATEGORIES") {
            const { categories } = req.body;
            await layoutModel.create({ type:"CATEGORIES", categories });
        };
        res.status(200).json({
            success: true,
            message: "layout created successfully"
        })

    } catch(error: any) {
        return next(new ErrorHandler(error.messagem, 500));
    }
});

// Edit layout only for admin
export const editLayout = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const { type } = req.body;
        if(!type) {
            return next(new ErrorHandler("The type of layout is required", 400));  
        }
        const layout = await layoutModel.findOne({ type });
        if(!layout) {
            return next(new ErrorHandler(`${type} not exist`, 400));
        };

        // banner 
        if(type === "BANNER") {
            const {image, title, subTitle} = req.body;
            const bannerLayout = layout;
            const oldBannerImagePublic_id = bannerLayout?.banner.image.public_id as string;
            const oldBannerImageUrl = bannerLayout?.banner.image.url as string;
            let newImage;
            if(!image.startsWith("http")) {
                await cloudinary.v2.uploader.destroy(oldBannerImagePublic_id);
                const myImageCloud = await cloudinary.v2.uploader.upload(image, {
                    folder: "banner",
                  });
                   newImage =  {
                    public_id: myImageCloud.public_id,
                    url: myImageCloud.secure_url
                }
            } else {
                newImage =  {
                    public_id: oldBannerImagePublic_id,
                    url: oldBannerImageUrl
                }
            }
            const banner:any = {
                image: newImage,
                title,
                subTitle
            };
            bannerLayout.banner = banner;
            await bannerLayout?.save();
        };
        // faq 
        if(type === "FAQ") {
         const { faq } = req.body;
         const faqLayout = layout;
         faqLayout.faq = faq.map((q:any) => (
            { question:q.question, 
               answer:q.answer
            }));
         await faqLayout.save();
        };
        // categories 
        if(type === "CATEGORIES") {
            const { categories } = req.body;
            const categoriesLayout = layout;
            categoriesLayout.categories = categories.map((c:any) => (
                { title:c.title  }
                ));
            await categoriesLayout.save();
        };
        res.status(200).json({
            success: true,
            message: "layout updated successfully"
        })

    } catch(error: any) {
        return next(new ErrorHandler(error.messagem, 500));
    }
});

// get layout
export const getLayout = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const { type } = req.params;
        if(!type) {
            return next(new ErrorHandler("The type of layout is required", 400));  
        };
        const layout = await layoutModel.findOne({ type });
        if(!layout) {
            return next(new ErrorHandler(`${type} not found`, 404));
        };
        res.status(200).json({
            success: true,
            layout
        });
    } catch(error: any) {
        return next(new ErrorHandler(error.messagem, 500));
    }
})
