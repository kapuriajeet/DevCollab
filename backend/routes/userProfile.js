import express from "express";
import {
  followUser,
  getCurrentUserProfile,
  getFollowers,
  getFollowing,
  getUserProfile,
  unfollowUser,
  updateUserProfile,
} from "../controllers/userProfileController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// GET Current User profile
router.get("/me", isAuthenticated, getCurrentUserProfile);
// GET User Profile by Id
router.get("/:profileId", getUserProfile);

// PATCH Update User Profile 
router.patch(
  "/me",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

// Follow User
router.patch("/:profileId/follow", isAuthenticated, followUser);
// UnFollow User
router.patch("/:profileId/unfollow", isAuthenticated, unfollowUser);
// Getting Followers List
router.get('/:profileId/followers', getFollowers);
// Getting Following List
router.get('/:profileId/following', getFollowing);
export default router;
