import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";

interface DecodedToken extends JwtPayload {
  _id: string;
  email: string;
  username: string;
  fullName: string;
}

const verifyJwt = asyncHandler(async (req: any, res: any, next: any) => {
  try {
    const token =
      req.signedCookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as DecodedToken;

    if (!decodedToken) {
      throw new ApiError(500, "Could not decode access token");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Bad Access Token");
  }
});

export default verifyJwt;
