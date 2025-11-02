import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import { Post } from "../models/posts/post.model";
import ApiError from "../utils/apiError";
import { Comment } from "../models/posts/comment.model";
import ApiResponse from "../utils/apiRespose";

const createComment = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;
  const { postId } = req.params;
  const { content } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  if (!content || content.trim === "") {
    throw new ApiError(400, "Comment should not be blank");
  }
  const comment = await Comment.create({
    content,
    authorId: userId,
    postId,
  });

  if (!comment) {
    throw new ApiError(500, "Error occured while commenting");
  }

  await Post.findByIdAndUpdate(postId, {
    $inc: {
      commentCount: 1,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Successfully created new comment", comment));
});

const getCommentsForPost = asyncHandler(async (req: any, res: any) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        postId: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "authorInfo",
      },
    },
    {
      $unwind: {
        path: "$authorInfo",
        preserveNullAndEmptyArrays: true, // keep comments even after author deleted
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likeCount: 1,
        dislikeCount: 1,
        author: {
          username: "$authorInfo.username",
          fullName: "$authorInfo.fullName",
          avatar: "$authorInfo.avatar",
        },
      },
    },
  ]);

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 15,
    customLabels: { docs: "comments" },
  };

  const comments = await Comment.aggregatePaginate(aggregate, options);

  if (!comments) {
    throw new ApiError(500, "Something went wrong while fetching commments");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comments));
});

const deleteComment = asyncHandler(async (req: any, res: any) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }
  const postId = comment.postId;
  await Comment.findByIdAndDelete(commentId);

  await Post.findByIdAndUpdate(postId, {
    $inc: {
      commentCount: -1,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"));
});

const updateComment = asyncHandler(async (req: any, res: any) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not Allowed");
  }

  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!newComment) {
    throw new ApiError(500, "Something went wrong while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", newComment));
});
export { createComment, getCommentsForPost, deleteComment, updateComment };
