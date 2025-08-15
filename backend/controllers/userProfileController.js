import mongoose from "mongoose";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({ _id: userId }).exec();

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const profileId = user.profile;

    const userProfile = await UserProfile.findOne({ _id: profileId }).exec();

    if (!userProfile)
      return res
        .status(400)
        .json({ success: false, message: "UserProfile not found" });

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully!",
      userProfile,
    });
  } catch (error) {
    console.log(`Error occurred while getting user profile: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while getting user profile.",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { username, skills, address, bio, socialLinks } = req.body;
    const profileId = req.params.profileId;
    
    let avatarUrl;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            resource_type: "image",
          },
          (error, uploadedImage) => {
            if (error) return reject(error);
            resolve(uploadedImage);
          }
        );
        stream.end(req.file.buffer);
      });
      avatarUrl = result.secure_url;
    }

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
      ...(socialLinks && { socialLinks: JSON.parse(socialLinks) }), // handle JSON string from form-data
      ...(avatarUrl && { avatar: avatarUrl }),
    };

    const updatedProfile = await UserProfile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.log(`Error occurred while updating user profile: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while updating user profile.",
      error: error
    });
  }
};
