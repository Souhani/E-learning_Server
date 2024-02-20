require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { Session } from "../utils/sessions";

export interface IRegistration {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    try {
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user: IRegistration = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const { activationCode, token } = activationToken;
      const data = { user: { name: user.name }, activationCode };
      try {
        await sendMail({
          email: user.email,
          template: "activation-mail.ejs",
          subject: "Activate your account",
          data,
        });
        res.status(201).json({
          seccess: true,
          message: `please check your email: ${user.email} to activate your account`,
          activationToken: token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  activationCode: string;
  token: string;
}

function createActivationToken(user: IRegistration): IActivationToken {
  const activationCode: string = Math.floor(
    1000 + Math.random() * 9000
  ).toString();
  const token: string = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );
  return {
    activationCode,
    token,
  };
}

interface IActivationReq {
  activation_code: string;
  activation_token: string;
}

export const activateUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_code, activation_token } = req.body as IActivationReq;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as Secret
      ) as { user: IUser; activationCode: string };
      if (activation_code !== newUser.activationCode) {
        return next(new ErrorHandler("Invalide activation code", 400));
      }
      const { name, email, password } = newUser.user;
      const isUserExist = await userModel.findOne({ email });
      if (isUserExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });
      res.status(201).json({ success: true });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IloginReq {
  email: string;
  password: string;
}
export const loginUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as IloginReq;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and passowrd", 400));
      }
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      sendToken(user, 200, res, next);
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;
    try {
      const accessTokenDecoded = jwt.verify(
        access_token as string,
        process.env.ACCESS_TOKEN_SECRET as Secret
      ) as JwtPayload;
      // delete user session from redis
      const sessionId = accessTokenDecoded.sessionId
      redis.del(sessionId);
      redis.del(req?.user?._id);
      // reset client cookies
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      res.status(200).json({
        success: true,
        message: "user loged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateAccessToken = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const message = "Login to access this resource";
      if (!refresh_token) {
        return next(new ErrorHandler(message, 400));
      }
      const refreshTokenDecoded = jwt.verify(
        refresh_token as string,
        process.env.REFRESH_TOKEN_SECRET as Secret
      ) as JwtPayload;
      if (!refreshTokenDecoded) {
        return next(new ErrorHandler(message, 400));
      }
      const sessionString = await redis.get(refreshTokenDecoded.sessionId as string);
      if (!sessionString) {
        return next(new ErrorHandler(message, 400));
      };
       const session:Session = JSON.parse(sessionString);
       if (!session.valid) {
        return next(new ErrorHandler(message, 400));
      };
      const accessToken = jwt.sign(
        { id: session.userId,  sessionId: session.sessionId},
        process.env.ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn: '5m',
        }
      );
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.status(200).json({
        sucess: true,
        accessToken,
      });
    // reset user expire to redis (expires in 7 days)
     redis.expire(session.userId,604800); // EX: 7 days.
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user info
export const getUserInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.user?._id;
      // get user info from redis
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}
// social auth
export const socialAuth = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      console.log("req.cookies",{...req.cookies})
      console.log("__Secure-next-auth.session-token",req.cookies["__Secure-next-auth.session-token"])
      const nextAuthToken = req.cookies["__Secure-next-auth.session-token"] || req.cookies["next-auth.session-token"];
      console.log("nextAuthToken",nextAuthToken)
      if(!nextAuthToken) {
        return next(new ErrorHandler("Token is reqiured for social authentication",400));
      }
      const isNextAuthSessionExist = await redis.get(`user:session:${nextAuthToken}`);
      if(!isNextAuthSessionExist) {
        return next(new ErrorHandler("Session Expired",400));
      }
      // check if the nextAuthSession is for the same requested user email
      const userSession = await redis.get(`user:${JSON.parse(isNextAuthSessionExist).userId}`);
      if(!userSession) {
        return next(new ErrorHandler("User session not found",400));
      }
      if(JSON.parse(userSession).email !== email) {
        return next(new ErrorHandler("Something went wrong!",400));
      }
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({
          name,
          email,
          avatar : {
            public_id:"",
            url: avatar
          },
        });
        sendToken(newUser, 200, res, next);
      } else {
        sendToken(user, 200, res, next);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//updating user info
interface IUserUpdateInfo {
  name?: string;
  email?: string;
}
export const updateUserInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUserUpdateInfo;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      //update email
      if (user && email) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }
        user.email = email;
      }
      //update name
      if (user && name) {
        user.name = name;
      }
      // save changes to the database
      await user?.save();
      // save chnages to the cache
      await redis.set(userId, JSON.stringify(user), "EX", 604800);
      // responde with the new user info
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//updating user password
interface IUserPassword {
  oldPassword: string;
  newPassword: string;
}
export const updateUserPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUserPassword;
      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("please enter old and new password", 400));
      }
      const userId = req.user?._id;
      const user = await userModel.findById(userId).select("+password");
      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }
      const isPasswordMatch = await user.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }
      user.password = newPassword;
      // save the changes to the database
      await user.save();
      // save the changes to the cache
      await redis.set(userId, JSON.stringify(user), "EX", 604800);
      // response with the new user info
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// updating prfile picture
interface IUserProfilePicture {
  avatar: string;
}
export const updateProfilePicture = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUserProfilePicture;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (avatar && user) {
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        };
        const myAvatarCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150
        });
         user.avatar = {
          public_id: myAvatarCloud.public_id,
          url: myAvatarCloud.secure_url
         };
      };
      // save new profile pic to the database
      await user?.save();
      // save new profile pic to cache
      await redis.set(userId, JSON.stringify(user), "EX", 604800);
      // response with new changes
      res.status(200).json({
      success: true,
      user
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all users only for admin
export const getAllUsres = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try {
    await getAllUsersService(res);
  } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
});

interface userRoleData {
  email: string;
  role: string;
}
// update user role (only for admin).
export const updateUserRole = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  try {
    const { email, role } = req.body as userRoleData;
    if(!email || !role) {
      return next(new ErrorHandler('please provide both email and role', 400));
    };
    if(!email.includes("@")) {
      return next(new ErrorHandler('not a valid email', 404));
    }
    updateUserRoleService(email, role, res, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// admin delete user 
export const deleteUser = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {
  const access_token = req.cookies.access_token as string;
  try {
    const userId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorHandler('user not found', 404));
    };
    const user = await userModel.findById(userId);
    if(!user) {
      return next(new ErrorHandler('user not found', 404));
    };
    await user.deleteOne({ userId });
    await redis.del(userId);
      const accessTokenDecoded = jwt.verify(
        access_token as string,
        process.env.ACCESS_TOKEN_SECRET as Secret
      ) as JwtPayload;
      // delete user session from redis
      const sessionId = accessTokenDecoded.sessionId
      redis.del(sessionId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
