import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createComment, deleteComment, getCommentsByPost, likeOrUnlikeComment, updateComment } from "../controllers/commentController.js";
const router = express.Router();


router.post("/create", isAuthenticated, createComment);
router.get("/:postId", isAuthenticated, getCommentsByPost);
router.patch("/:commentId", isAuthenticated, updateComment);
router.delete("/:commentId", isAuthenticated, deleteComment);
router.post("/:commentId/like", isAuthenticated, likeOrUnlikeComment);
export default router;
