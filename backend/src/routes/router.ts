import { Router } from "express";
import {
  changeCurrentPassword,
  getUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateUserInfo,
} from "../controllers/user.controller";
import verifyJwt from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refreshToken").post(verifyJwt, refreshAccessToken);
router.route("/changePassword").post(verifyJwt, changeCurrentPassword);
router.route("/getUser").get(verifyJwt, getUser);
router.route("/updateUserInfo").post(verifyJwt, updateUserInfo);
router.route("/updateUserAvatar").patch(verifyJwt, upload.single("avatar"), updateAvatar);

export default router;
