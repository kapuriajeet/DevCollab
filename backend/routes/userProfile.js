import express from "express";
import {
  getUserProfile,
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

export default router;
