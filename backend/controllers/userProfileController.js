import UserProfile from "../models/UserProfile.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get Logged In User Profile
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const profileId = req.user.profile._id;
  const userProfile = await UserProfile.findById(profileId).lean();
  if (!userProfile) throw new ApiError(404, "User Profile not found");

  return res.status(200).json(new ApiResponse(200, userProfile, "User Profile fetched successfully"));
});

// Get User Profile by Id
export const getUserProfile = asyncHandler(async (req, res) => {
  const profileId = req.params.profileId;

  const userProfile = await UserProfile.findById(profileId);

  if (!userProfile) throw new ApiError(404, "User Profile not found");

  return res.status(200).json(new ApiResponse(200, userProfile, "User Profile fetched successfully"));
});

// Update User Profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, skills, address, bio, socialLinks } = req.body;
  const profileId = req.user.profile._id;

  let avatarUrl;

  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    const result = await uploadOnCloudinary(avatarLocalPath, "devcollab/avatar");
    avatarUrl = result.secure_url;
  }

  let parsedSocialLinks = null;
  if (!socialLinks) throw new ApiError(400, "Invalid social links format");
  parsedSocialLinks = JSON.parse(socialLinks);

  // Prepare update data
  const updateData = {
    ...(username && { username }),
    ...(skills && {
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()),
    }),
    ...(address && { address }),
    ...(bio && { bio }),
    ...(socialLinks && { socialLinks: parsedSocialLinks }), // handle JSON string from form-data
    ...(avatarUrl && { avatar: avatarUrl }),
  };
  console.log("Update Controller: ", updateData);

  const updatedProfile = await UserProfile.findByIdAndUpdate(
    profileId,
    updateData,
    { new: true, lean: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedProfile, "User Profile Updated successfully"));
});

// Follow a User
export const followUser = asyncHandler(async (req, res) => {
  const currentUserProfileId = String(req.user.profile._id);
  const targetUserProfileId = req.params.profileId;

  console.log("CUPI", currentUserProfileId);
  console.log("TUPI", targetUserProfileId);
  if (currentUserProfileId === targetUserProfileId) {
    throw new ApiError(400, "Cannot follow yourelf");
  }

  const alreadyFollowing = await UserProfile.exists({
    _id: currentUserProfileId,
    following: targetUserProfileId
  });

  if (alreadyFollowing) {
    throw new ApiError(400, "Already following the user");
  }
  await UserProfile.findByIdAndUpdate(
    currentUserProfileId,
    { $addToSet: { following: targetUserProfileId } },
    { new: true }
  );

  const updatedProfile = await UserProfile.findByIdAndUpdate(
    targetUserProfileId,
    { $addToSet: { followers: currentUserProfileId } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedProfile, "User followed successfully"));
});


// Unfollow a User
export const unfollowUser = asyncHandler(async (req, res) => {
  const currentUserProfileId = String(req.user.profile._id);
  const targetUserProfileId = req.params.profileId;

  if (currentUserProfileId === targetUserProfileId)
    throw new ApiError(400, "Cannot unfollow yourself");

  const isFollowing = await UserProfile.exists({
    _id: currentUserProfileId,
    following: targetUserProfileId,
  });

  if (!isFollowing) {
    throw new ApiError(400, "You are not following this user");
  }
  await UserProfile.findByIdAndUpdate(
    currentUserProfileId,
    { $pull: { following: targetUserProfileId } },
    { new: true }
  );

  const updatedProfile = await UserProfile.findByIdAndUpdate(
    targetUserProfileId,
    { $pull: { followers: currentUserProfileId } },
    { new: true }
  );

  return res.status(200).json(200, updatedProfile, "User unfollowd successfully");
});

// Get Followers of a user
export const getFollowers = asyncHandler(async (req, res) => {
  const profileId = req.params.profileId;

  const user = await UserProfile.findById(profileId)
    .populate("followers", "username avatar")
    .lean();

  if (!user)
    throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.followers, "Got User followers successfully")
    );
});

// Get Followings for a user
export const getFollowing = asyncHandler(async (req, res) => {
  const profileId = req.params.profileId;

  const user = await UserProfile.findById(profileId)
    .populate("following", "username avatar")
    .lean();

  if (!user)
    throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.following, "User following successfull")
    );
});

