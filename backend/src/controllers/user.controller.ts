import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiRespose";
import mongoose from "mongoose";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/imageUpload";
import { Follow } from "../models/follow.model";
import { User } from "../models/user.model";
import { Post } from "../models/posts/post.model";
import { Bookmark } from "../models/posts/bookmark.model";

const getUser = asyncHandler(async (req: any, res: any) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "got user successfully", req.user));
});

const getUserProfile = asyncHandler(async (req: any, res: any) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).select(
    "-email -password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const posts = await Post.find({ authorId: user._id }).sort({
    createdAt: -1,
  });
  const publicProfile = {
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
    bio: user.bio,
    links: user.links,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    postsCount: user.postsCount,
  };
  return res.status(200).json(
    new ApiResponse(200, "User Profile fetched successfully", {
      user: publicProfile,
      posts: posts,
    })
  );
});

const updateUserInfo = asyncHandler(async (req: any, res: any) => {
  const { bio, links, fullName } = req.body;
  const updateFields: Record<string, any> = {};

  if (bio !== undefined) updateFields.bio = bio;
  if (links !== undefined) updateFields.links = links;
  if (fullName !== undefined) updateFields.fullName = fullName;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User info updated successfully", user));
});

const updateAvatar = asyncHandler(async (req: any, res: any) => {
  const localPath = req.file?.path;
  if (!localPath) {
    throw new ApiError(400, "Avatar file is needed");
  }
  const avatar = await uploadOnCloudinary(localPath);
  if (!avatar) {
    throw new ApiError(
      500,
      "Something went wrong while uploading image on server"
    );
  }
  if (req.user.avatar) {
    await removeFromCloudinary(req.user.avatar);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", avatar.url));
});

// Get user followers
const getUserFollowers = asyncHandler(async (req: any, res: any) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(400, "Invalid username");
  }

  const followers = await Follow.find({ followingId: user._id })
    .populate({
      path: "followerId",
      select: "username fullName avatar bio -_id",
    })
    .select("followerId createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      "Followers retrieved successfully",
      followers.map((f) => f.followerId)
    )
  );
});

// Get user following
const getUserFollowing = asyncHandler(async (req: any, res: any) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(400, "Valid user ID is required");
  }

  const following = await Follow.find({ followerId: user._id })
    .populate({
      path: "followingId",
      select: "username fullName avatar bio -_id",
    })
    .select("followingId createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      "Following retrieved successfully",
      following.map((f) => f.followingId)
    )
  );
});

const toggleFollow = asyncHandler(async (req: any, res: any) => {
  const { username } = req.params;
  const currentUserId = req.user._id;

  const targetUser = await User.findOne({ username });
  const userId = targetUser?._id;

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }
  if (userId?.toString() === currentUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  // Check if follow relationship exists
  const existingFollow = await Follow.findOne({
    followerId: currentUserId,
    followingId: userId,
  });

  if (existingFollow) {
    // Unfollow: Delete the follow document
    await Follow.deleteOne({ _id: existingFollow._id });

    // Decrement counts
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: -1 },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Unfollowed successfully", { following: false })
      );
  } else {
    // Follow: Create the follow document
    await Follow.create({
      followerId: currentUserId,
      followingId: userId,
    });

    // Increment counts
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: 1 },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Followed successfully", { following: true }));
  }
});

const toggleBookmark = asyncHandler(async (req: any, res: any) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const existingBookmark = await Bookmark.findOne({
    userId,
    postId,
  });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });

    await User.findByIdAndUpdate(userId, { $inc: { bookmarkCount: -1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, "UnBookmarked Successfully"));
  } else {
    await Bookmark.create({
      userId,
      postId,
    });

    await User.findByIdAndUpdate(userId, { $inc: { bookmarkCount: 1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, "Bookmarked Successfully"));
  }
});

const getBookmarkedPosts = asyncHandler(async (req: any, res: any) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  const bookmarks = await Bookmark.find({
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookmarks fetched successfully", bookmarks));
});

export {
  getUser,
  updateUserInfo,
  updateAvatar,
  getUserProfile,
  getUserFollowers,
  getUserFollowing,
  toggleFollow,
  toggleBookmark,
  getBookmarkedPosts
};
