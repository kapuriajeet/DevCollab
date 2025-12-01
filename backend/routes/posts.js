import express from 'express';
import { uploadMedia, createPost, getAllPosts, getLoggedInUserPosts, getUserPost, getPostById, likeOrUnlikePost } from '../controllers/postsController.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import multer from 'multer';
const router = express.Router();

const upload = multer({ dest: "temp/" });

router.post("/upload", isAuthenticated, upload.array("files"), uploadMedia);
router.post("/create", isAuthenticated, createPost);
router.get("/", isAuthenticated, getAllPosts);
router.get("/me", isAuthenticated, getLoggedInUserPosts);
router.get("/user/:userId", isAuthenticated, getUserPost);
router.get("/:postId", isAuthenticated, getPostById);
router.post("/:postId/like", isAuthenticated, likeOrUnlikePost);
export default router;
