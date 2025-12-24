import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// Access or create 1-to-1 chat
router.post("/", isAuthenticated, accessChat);

// Get all chats for logged-in user
router.get("/", isAuthenticated, fetchChats);

// Create group chat
router.post("/group", isAuthenticated, createGroupChat);

// Rename group chat
router.patch("/rename", isAuthenticated, renameGroup);

// Add user to group
router.patch("/groupadd", isAuthenticated, addToGroup);

// Remove user from group
router.patch("/groupremove", isAuthenticated, removeFromGroup);

// Delete chat
router.delete("/:chatId", isAuthenticated, deleteChat);

export default router;

