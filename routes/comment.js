import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  likeOrUnlikeComment,
  updateComment,
} from "../controllers/commentController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment creation, update, deletion and likes
 */

/**
 * @swagger
 * /api/v1/comments/create:
 *   post:
 *     summary: Create a comment on a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *                 example: 665fd1f98b7f23caa8c1f321
 *               content:
 *                 type: string
 *                 example: This post is awesome 🚀
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/create", isAuthenticated, createComment);

/**
 * @swagger
 * /api/v1/comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/:postId", isAuthenticated, getCommentsByPost);

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment text ✨
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/:commentId", isAuthenticated, updateComment);

/**
 * @swagger
 * /api/v1/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:commentId", isAuthenticated, deleteComment);

/**
 * @swagger
 * /api/v1/comments/{commentId}/like:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment liked or unliked successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:commentId/like", isAuthenticated, likeOrUnlikeComment);

export default router;
