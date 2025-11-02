import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import { User } from "../models/user.model";
import { Post } from "../models/posts/post.model";
import ApiResponse from "../utils/apiRespose";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/imageUpload";
import { Follow } from "../models/follow.model";

const createPost = asyncHandler(async (req: any, res: any) => {
  const { title, category, description, techStack, repo, article, code } =
    req.body;
  [title, category, description, techStack].forEach((element) => {
    if (!element) {
      throw new ApiError(400, "All fields are required");
    }
  });

  const postData: any = {
    title,
    category,
    description,
    techStack,
    authorId: req.user._id,
  };

  switch (category) {
    case "repo":
      if (!repo || !repo.repoUrl) {
        throw new ApiError(400, "Please provide repo link");
      }
      postData.repo = repo;
      break;

    case "article":
      if (!article || !article.content) {
        throw new ApiError(400, "Article content needed");
      }
      postData.article = article;
      break;

    case "code":
      if (!code || !code.language || !code.codeBlock) {
        throw new ApiError(400, "All fields are required");
      }
      postData.code = code;
      break;

    default:
      throw new ApiError(400, "Invalid post type");
  }

  if (req.file) {
    const imageLocalPath = req.file?.path;
    const image = await uploadOnCloudinary(imageLocalPath);
    if (!image) {
      throw new ApiError(500, "Unable to upload image");
    }
    postData.image = image.url;
  }

  const post = await Post.create(postData);
  if (!post) {
    throw new ApiError(500, "Something went wrong while creating new post");
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, "Post created Successfully", post));
});

const getPostById = asyncHandler(async (req: any, res: any) => {
  const { postId } = req.params;
  const post = await Post.findById(postId).populate({
    path: "authorId",
    select: "username avatar -_id",
  });
  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Post fetched successfully", post));
});

const deletePost = asyncHandler(async (req: any, res: any) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.deleteOne({ _id: postId });

  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, "Post deleted successfully"));
});

const updatePost = asyncHandler(async (req: any, res: any) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid Post ID");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  const { description, techStack, repo, article, code } = req.body;

  const updatePayload: any = {};

  if (description) updatePayload.description = description;
  if (techStack) updatePayload.techStack = techStack;

  switch (post.category) {
    case "repo":
      if (repo?.repoUrl) updatePayload["repo.repoUrl"] = repo.repoUrl;
      break;
    case "article":
      if (article?.content) updatePayload["article.content"] = article.content;
      break;
    case "code":
      if (code?.language) updatePayload["code.language"] = code.language;
      if (code?.codeBlock) updatePayload["code.codeBlock"] = code.codeBlock;
      break;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: updatePayload,
    },
    { new: true, runValidators: true }
  );

  if (!updatedPost) {
    throw new ApiError(500, "Something went wrong while updating the post");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Post updated successfully", updatePost));
});

const getFeed = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;

  const following = await Follow.find({ followerId: userId });
  const followingIds = following.map((fol) => fol.followinId);
  followingIds.push(userId);

  const aggregate = Post.aggregate([
    {
      $match: {
        authorId: { $in: followingIds },
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
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $project: {
        title: 1,
        category: 1,
        description: 1,
        techStack: 1,
        repo: 1,
        article: 1,
        code: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1,

        // Include specific, safe author fields
        author: {
          username: "$author.username",
          fullName: "$author.fullName",
          avatar: "$author.avatar",
        },
      },
    },
  ]);

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  };

  const feed = await Post.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, "Feed fetched successfully", feed));
});

const getExploreFeed = asyncHandler(async (req: any, res: any) => {
  const aggregate = Post.aggregate([
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
        preserveNullAndEmptyArrays: true, // to handle the case when authors account deleted
      },
    },
    {
      $match: {
        authorInfo: { $ne: null }, // do not show posts of deleted authors
      },
    },
    {
      $project: {
        title: 1,
        category: 1,
        description: 1,
        techStack: 1,
        repo: 1,
        article: 1,
        code: 1,
        image: 1, // Include the main image
        likeCount: 1,
        commentCount: 1,
        createdAt: 1,

        // Create a clean author object
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
    limit: parseInt(req.query.limit) || 20,
  };

  const feed = await Post.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, "Explore feed fetched successfully", feed));
});

export {
  createPost,
  getPostById,
  deletePost,
  updatePost,
  getFeed,
  getExploreFeed,
};
