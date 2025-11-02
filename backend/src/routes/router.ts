import { Router } from "express";
import {
  getUser,
  updateAvatar,
  getUserProfile,
  updateUserInfo,
  toggleFollow,
  getUserFollowers,
  getUserFollowing,
  toggleBookmark,
  getBookmarkedPosts,
} from "../controllers/user.controller";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
} from "../controllers/auth.controller";

import verifyJwt from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
  createPost,
  getPostById,
  deletePost,
  updatePost,
  getFeed,
  getExploreFeed,
} from "../controllers/post.controller";

import {
  createComment,
  getCommentsForPost,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller";

import { toggleReaction } from "../controllers/reaction.controller";

const router = Router();

// Auth routes
router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);
router.route("/auth/logout").post(verifyJwt, logoutUser);
router.route("/auth/refreshToken").post(verifyJwt, refreshAccessToken);
router.route("/auth/changePassword").post(verifyJwt, changeCurrentPassword);

// User routes

// Private
router.route("/users/me").get(verifyJwt, getUser);
router.route("/users/me").put(verifyJwt, updateUserInfo);
router
  .route("/users/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router.route("/users/:username/follow").post(verifyJwt, toggleFollow);
router.route("/users/me/bookmarks").get(verifyJwt, getBookmarkedPosts);
router.route("/users/bookmark/:postId").post(verifyJwt, toggleBookmark);
// Public
router.route("/users/:username").get(getUserProfile);
router.route("/users/:username/followers").get(getUserFollowers);
router.route("/users/:username/following").get(getUserFollowing);

// Post routes

// Private
router.route("/posts").post(verifyJwt, upload.single("image"), createPost);
router.route("/posts/:postId").delete(verifyJwt, deletePost);
router.route("/posts/:postId").put(verifyJwt, updatePost);
router.route("/posts/feed").get(verifyJwt, getFeed);
router.route("/posts/explore").get(verifyJwt, getExploreFeed);
// Public
router.route("/posts/:postId").get(getPostById);

// Comment routes
// Private
router.route("/posts/:postId/comments").post(verifyJwt, createComment);
router.route("/comments/:commentId").delete(verifyJwt, deleteComment);
router.route("/comments/:commentId").put(verifyJwt, updateComment);
// Public
router.route("/posts/:postId/comments").get(getCommentsForPost);

// Reaction
router.route("/react").post(verifyJwt, toggleReaction);

export default router;
