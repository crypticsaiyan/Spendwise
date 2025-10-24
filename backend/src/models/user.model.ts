import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
    trim: true,
  },
  links: {
    type: [String],
    default: [],
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  postsCount: {
    type: Number,
    default: 0,
  },
  refreshToken: {
    type: String,
  },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);