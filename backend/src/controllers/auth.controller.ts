import { User, DecodedToken } from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiRespose";
import jwt, { Secret } from "jsonwebtoken";
import mongoose from "mongoose";

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  signed: true,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  signed: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const deleteCookieOptions = {
  httpOnly: true,
  signed: true,
  secure: true,
  sameSite: "strict",
};

const generateTokens = async (userId: mongoose.Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "User does not exist");
    }
    const accessToken: string = user.generateAccessToken();
    const refreshToken: string = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // skip schema validation, only new field written to db
    return { accessToken, refreshToken };
  } catch (error: any) {
    throw new ApiError(500, error.message);
  }
};
const registerUser = asyncHandler(async (req: any, res: any) => {
  //fetch the data from req body
  const { username, fullName, email, password } = req.body;
  [username, fullName, email, password].forEach((element) => {
    if (!element || element.trim() === "") {
      throw new ApiError(400, "All fields are required");
    }
  });

  //check if user already exists
  if (await User.findOne({ $or: [{ email }, { username }] })) {
    throw new ApiError(409, "User with given email or username already exists");
  }

  //create user
  const user = await User.create({
    username: username.trim().toLowerCase(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req: any, res: any) => {
  const { username, email, password } = req.body; // enter email or username to login
  if (!username && !email) {
    throw new ApiError(400, "Please provide username or email");
  }
  if (!password) {
    throw new ApiError(400, "Password needed!");
  }

  const requestedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (!requestedUser) {
    throw new ApiError(400, "User does not exist! Register first");
  }

  const isPassCorrect = await requestedUser.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(401, "Wrong password");
  }

  const { accessToken, refreshToken } = await generateTokens(requestedUser._id);
  const loggedInUser = await User.findById(requestedUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .json(
      new ApiResponse(200, "Logged in Successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req: any, res: any) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true, // return the updated doc
    }
  );

  return res
    .status(200)
    .clearCookie("refreshToken", deleteCookieOptions)
    .clearCookie("accessToken", deleteCookieOptions)
    .json(new ApiResponse(200, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
  try {
    const incomingRefreshToken =
      req.signedCookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as Secret
    ) as DecodedToken;

    const user = await User.findById(decodedRefreshToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token is expired");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json(
        new ApiResponse(200, "Access Token refreshed successfully", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Unable to refresh access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req: any, res: any) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password must match");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword
}