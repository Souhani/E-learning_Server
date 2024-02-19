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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// the pattern that emails should follow
const emailRegexPatter = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// user schema
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        validate: {
            validator: function (value) {
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
                type: mongoose_1.default.Types.ObjectId,
                ref: "Course"
            }
        }
    ],
}, { timestamps: true });
// hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// sign access token
userSchema.methods.signAccessToken = function (sessionId) {
    return jsonwebtoken_1.default.sign({ id: this._id, sessionId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m',
    });
};
// sign refresh token
userSchema.methods.signRefreshToken = function (sessionId) {
    return jsonwebtoken_1.default.sign({ sessionId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '31d',
    });
};
//compare password with the hash
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
// user model
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
