import UserProfile from "../models/UserProfile.js";
import cloudinary from "../config/cloudinary.js";


export const getCurrentUserProfile = async (req, res) => {
  try {
    const profileId = req.user.profile._id;
    const userProfile = await UserProfile.findById(profileId).lean();
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }
    return res.status(200).json({
      success: true,
      message: "User Profile fetched successfully!",
      userProfile
    });
  } catch (error) {
    console.log(`Error occurred while getting user profile: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while getting user profile.",
    });

  }
};
export const getUserProfile = async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const userProfile = await UserProfile.findById(profileId);

    if (!userProfile)
      return res
        .status(404)
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
    const profileId = req.user.profile._id;

    let avatarUrl;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "devcollab/avatars",
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

    let parsedSocialLinks = null;
    if (socialLinks) {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid sociallinks format"
        });
      }
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
      ...(socialLinks && { socialLinks: parsedSocialLinks }), // handle JSON string from form-data
      ...(avatarUrl && { avatar: avatarUrl }),
    };
    console.log("Update Controller: ", updateData);

    const updatedProfile = await UserProfile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true, lean: true }
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
      error: error,
    });
  }
};

export const followUser = async (req, res) => {
  try {
    const currentUserProfileId = String(req.user.profile._id);
    const targetUserProfileId = req.params.profileId;

    console.log("CUPI", currentUserProfileId);
    console.log("TUPI", targetUserProfileId);
    if (currentUserProfileId === targetUserProfileId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    const alreadyFollowing = await UserProfile.exists({
      _id: currentUserProfileId,
      following: targetUserProfileId
    });

    if (alreadyFollowing) {
      return res.status(400).json({ success: false, message: "Already following this user." });
    }
    await UserProfile.findByIdAndUpdate(
      currentUserProfileId,
      { $addToSet: { following: targetUserProfileId } },
      { new: true }
    );

    await UserProfile.findByIdAndUpdate(
      targetUserProfileId,
      { $addToSet: { followers: currentUserProfileId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User followed successfully.",
    });
  } catch (error) {
    console.log(`Error occurred while following user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while following user",
      error: error,
    });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const currentUserProfileId = String(req.user.profile._id);
    const targetUserProfileId = req.params.profileId;

    if (currentUserProfileId === targetUserProfileId)
      return res.status(400).json({ success: false, message: "Cannot unfollow yourself" });

    const isFollowing = await UserProfile.exists({
      _id: currentUserId,
      following: targetUserId,
    });

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user.",
      });
    }
    await UserProfile.findByIdAndUpdate(
      currentUserProfileId,
      { $pull: { following: targetUserProfileId } },
      { new: true }
    );

    await UserProfile.findByIdAndUpdate(
      targetUserProfileId,
      { $pull: { followers: currentUserProfileId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User Unfollowed successfully.",
    });
  } catch (error) {
    console.log(`Error occurred while unfollowing user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while unfollowing user",
      error: error,
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const user = await UserProfile.findById(profileId)
      .populate("followers", "username avatar")
      .lean();

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res
      .status(200)
      .json(
        { success: true, message: "Getting followers successully", followers: user.followers },
      );
  } catch (error) {
    console.log(`Error occurred while getting followers of a user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while getting followers of a user",
      error: error,
    });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const user = await UserProfile.findById(profileId)
      .populate("following", "username avatar")
      .lean();

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res
      .status(200)
      .json(
        { success: true, message: "Getting following successully", following: user.following },
      );
  } catch (error) {
    console.log(`Error occurred while getting following of a user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while getting following of a user",
      error: error,
    });
  }
};

