import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {

    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Error occurred while generating refresh and access token", error);
  }
};
export const registerController = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {

    throw new ApiError(400, "Name, email and password are required");
  }
  if (password.length < 6)
    throw new ApiError(400, "Password must be atleast 6 characters");

  const userExists = await User.findOne({ $or: [{ email }, { name }] });

  if (userExists)

    throw new ApiError(409, "User already exists");


  const user = await User.create({
    name,
    email,
    password
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) throw new ApiError(500, "Error occurred while registering user");

  const profile = new UserProfile({
    user,
    username: name,
    avatar: "",
    skills: [],
    address: "",
    bio: "",
    socialLinks: {},
    followers: [],
    following: [],
  });

  await profile.save();

  user.profile = profile._id;
  await user.save();

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("profile");
  if (!user) throw new ApiError(400, "No user found for this email id");


  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid User Credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true
  };
  return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User Logged In successfully"));
});

export const refreshTokenController = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");

    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }

});

export const deleteController = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const userProfileId = req.user.profile;
  await UserProfile.findByIdAndDelete(userProfileId);
  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, [], "User Deleted successfully"));
});

export const logoutController = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  const options = {
    httpOnly: true,
    secure: true
  };
  return res.status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out successfully"));
});
