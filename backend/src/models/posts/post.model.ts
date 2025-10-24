import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["article", "code", "repo"],
      required: true,
    },
    // Only for 'article' posts
    articleDetails: {
      content: { type: String },
    },

    // Only for 'code' posts
    codeDetails: {
      language: { type: String },
      codeBlock: { type: String },
    },

    // Only for 'repo' posts
    repoDetails: {
      repoUrl: { type: String },
      imageUrl: { type: String },
    },
    techStack: {
      type: [String],
      default: [],
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    dislikeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);