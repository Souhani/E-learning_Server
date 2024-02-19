import { v2 as cloudinary } from 'cloudinary'

const cloud_name =  process.env.CLOUD_NAME as string;
const api_key = process.env.CLOUD_API_KEY as string; 
const api_secret = process.env.CLOUD_SECRET_KEY as string;

export const connectCloudinary = () => {
    if(cloud_name && api_key && api_secret) {
        console.log("cloudinary info are provided");
        cloudinary.config({ 
            cloud_name,
            api_key,
            api_secret,
          });
    } else {
        throw new Error("cloudinary info are not provided");
    }
};