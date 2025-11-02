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
  getBookmarkedPosts
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
router.route("/:username").get(getUserProfile);
router.route("/:username/followers").get(getUserFollowers);
router.route("/:username/following").get(getUserFollowing);

export default router;
