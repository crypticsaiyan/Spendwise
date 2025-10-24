import mongoose, { Schema } from "mongoose";
import { ref } from "process";

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
