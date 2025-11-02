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

const router = Router();

// Auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refreshToken").post(verifyJwt, refreshAccessToken);
router.route("/changePassword").post(verifyJwt, changeCurrentPassword);

// User routes

// Private
router.route("/getUser").get(verifyJwt, getUser);
router.route("/updateUserInfo").post(verifyJwt, updateUserInfo);
router
  .route("/updateUserAvatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router.route("/follow/:username").post(verifyJwt, toggleFollow);
router.route("/getBookmarks").get(verifyJwt, getBookmarkedPosts);
router.route("/bookmark/:postId").post(verifyJwt, toggleBookmark);

// Public
router.route("/public/:username").get(getUserProfile);
router.route("/public/:username/followers").get(getUserFollowers);
router.route("/public/:username/following").get(getUserFollowing);

// Post routes

// Private
router.route("/post").post(verifyJwt, upload.single("image"), createPost);
router.route("/deletePost/:postId").delete(verifyJwt, deletePost);
router.route("/updatePost/:postId").patch(verifyJwt, updatePost);
router.route("/feed").get(verifyJwt, getFeed);
router.route("/explore").get(verifyJwt, getExploreFeed);

// Public
router.route("/posts/:postId").get(getPostById);

export default router;
