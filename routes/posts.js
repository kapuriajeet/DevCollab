import express from "express";
import {
  uploadMedia,
  createPost,
  getAllPosts,
  getLoggedInUserPosts,
  getUserPost,
  getPostById,
  likeOrUnlikePost,
  deletePost,
} from "../controllers/postsController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post creation, feed, likes and media APIs
 */

/**
 * @swagger
 * /api/v1/posts/upload:
 *   post:
 *     summary: Upload media files for a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/upload", isAuthenticated, upload.array("files"), uploadMedia);

/**
 * @swagger
 * /api/v1/posts/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *                 example: This is my first DevCollab post 🚀
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["image1.jpg", "image2.jpg"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/create", isAuthenticated, createPost);

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", isAuthenticated, getAllPosts);

/**
 * @swagger
 * /api/v1/posts/me:
 *   get:
 *     summary: Get posts of the logged-in user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User posts fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", isAuthenticated, getLoggedInUserPosts);

/**
 * @swagger
 * /api/v1/posts/user/{userid}:
 *   get:
 *     summary: Get posts of a specific user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User posts fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/user/:userid", isAuthenticated, getUserPost);

/**
 * @swagger
 * /api/v1/posts/{postid}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post fetched successfully
 *       404:
 *         description: Post not found
 */
router.get("/:postid", isAuthenticated, getPostById);

/**
 * @swagger
 * /api/v1/posts/{postid}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post liked or unliked successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/:postid/like", isAuthenticated, likeOrUnlikePost);

/**
 * @swagger
 * /api/v1/posts/{postid}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postid
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/:postid", isAuthenticated, deletePost);

export default router;
