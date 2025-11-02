import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
    imageUrl: { type: String },
    category: {
      type: String,
      enum: ["article", "code", "repo"],
      required: true,
    },
    // Only for 'article' posts
    article: {
      content: { type: String },
    },

    // Only for 'code' posts
    code: {
      language: { type: String },
      codeBlock: { type: String },
    },

    // Only for 'repo' posts
    repo: {
      repoUrl: { type: String },
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

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);
