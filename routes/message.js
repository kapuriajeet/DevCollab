import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getAllMessages,
  markMessageAsRead,
  markChatAsRead,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Send a message
router.post("/", isAuthenticated, sendMessage);

// Get all messages for a chat
router.get("/:chatId", isAuthenticated, getAllMessages);

// Mark a message as read
router.patch("/:messageId/read", isAuthenticated, markMessageAsRead);

// Mark all messages in a chat as read
router.patch("/chat/:chatId/read", isAuthenticated, markChatAsRead);

// Delete a message
router.delete("/:messageId", isAuthenticated, deleteMessage);

export default router;

