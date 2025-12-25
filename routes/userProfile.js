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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile, follow and social graph APIs
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", isAuthenticated, getCurrentUserProfile);

/**
 * @swagger
 * /api/v1/users/{profileId}:
 *   get:
 *     summary: Get user profile by profile ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User profile ID
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/:profileId", getUserProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: jeetkapuria
 *               bio:
 *                 type: string
 *                 example: Backend developer building DevCollab
 *               address:
 *                 type: string
 *                 example: Mumbai, India
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "MongoDB", "React"]
 *               socialLinks:
 *                 type: string
 *                 description: JSON string containing social links
 *                 example: >
 *                   {"github":"https://github.com/kapuriajeet","twitter":"https://twitter.com/jeet","linkedin":"https://www.linkedin.com/in/jeet-kapuria-3912b4214/"}
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/me",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

/**
 * @swagger
 * /api/v1/users/{profileId}/follow:
 *   patch:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User profile ID to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:profileId/follow", isAuthenticated, followUser);

/**
 * @swagger
 * /api/v1/users/{profileId}/unfollow:
 *   patch:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User profile ID to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:profileId/unfollow", isAuthenticated, unfollowUser);

/**
 * @swagger
 * /api/v1/users/{profileId}/followers:
 *   get:
 *     summary: Get followers list of a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User profile ID
 *     responses:
 *       200:
 *         description: Followers list fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/:profileId/followers", isAuthenticated, getFollowers);

/**
 * @swagger
 * /api/v1/users/{profileId}/following:
 *   get:
 *     summary: Get following list of a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: User profile ID
 *     responses:
 *       200:
 *         description: Following list fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/:profileId/following", isAuthenticated, getFollowing);

export default router;
