require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

// the pattern that emails should follow
const emailRegexPatter: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Result Items for a quiz
export interface IQuizResultItems extends Document {
  question_id: mongoose.Types.ObjectId;
  options_ids: mongoose.Types.ObjectId[];
}

// quiz result interface
export interface IQuizResults extends Document {
  quiz_id: mongoose.Types.ObjectId;
  results: IQuizResultItems[]; 
};

// interface for the user info
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerifid: boolean;
  courses: Array<object>;
  quizzesResults: IQuizResults[];
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: (sessionId:string) => string;
  signRefreshToken: (sessionId:string) => string;
}

// user schema
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
    },
    email: {
      type: String,
      required: [true, "please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPatter.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "User",
    },
    isVerifid: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        _id: {
            type: mongoose.Types.ObjectId,
            ref: "Course"
        }
      }
    ],
    quizzesResults: [
      {
        quiz_id: {
          type: mongoose.Types.ObjectId,
          ref: "Quiz"
      },
        results: [
          {
            question_id:  {
              type: mongoose.Types.ObjectId,
          },
            options_ids:[{type: mongoose.Types.ObjectId}]
          }
        ],
      }
    ],
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign access token
userSchema.methods.signAccessToken = function (sessionId:string): string {
  return jwt.sign(
    { id: this._id, sessionId },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: '5m',
    }
  );
};
// sign refresh token
userSchema.methods.signRefreshToken = function (sessionId:string): string {
  return jwt.sign(
    { sessionId },
    process.env.REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: '31d',
    }
  );
};

//compare password with the hash
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// user model
const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
