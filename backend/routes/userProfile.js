import express from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  getUserProfile,
  unfollowUser,
  updateUserProfile,
} from "../controllers/userProfileController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

// GET Profile for each user by id
router.get("/:userId", isAuthenticated, getUserProfile);

// PATCH Profile for each user
router.patch(
  "/:profileId",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

// Follower User
router.patch("/:profileId/follow", isAuthenticated, followUser);
// Unfollowe User
router.patch("/:profileId/unfollow", isAuthenticated, unfollowUser);
// Getting Followers List
router.get('/:profileId/followers', getFollowers)
// Getting Following List
router.get('/:profileId/following', getFollowing)
export default router;
