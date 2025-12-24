import express from 'express';
import { uploadMedia, createPost, getAllPosts, getLoggedInUserPosts, getUserPost, getPostById, likeOrUnlikePost, deletePost } from '../controllers/postsController.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { upload } from '../middlewares/multer.js';
const router = express.Router();

router.post("/upload", isAuthenticated, upload.array("files"), uploadMedia);
router.post("/create", isAuthenticated, createPost);
router.get("/", isAuthenticated, getAllPosts);
router.get("/me", isAuthenticated, getLoggedInUserPosts);
router.get("/user/:userId", isAuthenticated, getUserPost);
router.get("/:postId", isAuthenticated, getPostById);
router.post("/:postId/like", isAuthenticated, likeOrUnlikePost);
router.delete("/:postId", isAuthenticated, deletePost);

export default router;
