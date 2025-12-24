import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { getIO } from "../socket/socketServer.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;
    const senderId = req.user._id;

    if (!content || !chatId) {
      return res.status(400).json({
        success: false,
        message: "Content and chat ID are required",
      });
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === senderId.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send messages in this chat",
      });
    }

    const newMessage = {
      sender: senderId,
      content,
      chat: chatId,
      readBy: [senderId], // Mark as read by sender
    };

    let message = await Message.create(newMessage);

    message = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("chat");

    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    // Emit socket event for real-time messaging
    const io = getIO();
    io.to(chatId).emit("message_received", {
      message,
      chatId,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.log(`Error while sending message: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while sending message",
      error: error.message,
    });
  }
};

// Get all messages for a chat
export const getAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    // Check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === currentUserId.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view messages in this chat",
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("readBy", "name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(`Error while fetching messages: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching messages",
      error: error.message,
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(message.chat);
    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === currentUserId.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to mark this message as read",
      });
    }

    // Add user to readBy array if not already present
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: currentUserId } },
      { new: true }
    )
      .populate("sender", "name email")
      .populate("readBy", "name email");

    return res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.log(`Error while marking message as read: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while marking message as read",
      error: error.message,
    });
  }
};

// Mark all messages in a chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    // Check if user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === currentUserId.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to mark messages in this chat as read",
      });
    }

    // Update all messages in the chat to include current user in readBy
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: currentUserId } },
      { $addToSet: { readBy: currentUserId } }
    );

    return res.status(200).json({
      success: true,
      message: "All messages marked as read",
    });
  } catch (error) {
    console.log(`Error while marking chat as read: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while marking chat as read",
      error: error.message,
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(messageId);

    // Update latest message in chat if this was the latest message
    const chat = await Chat.findById(message.chat);
    if (chat.latestMessage?.toString() === messageId) {
      const lastMessage = await Message.findOne({ chat: message.chat })
        .sort({ createdAt: -1 });
      await Chat.findByIdAndUpdate(message.chat, {
        latestMessage: lastMessage?._id || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.log(`Error while deleting message: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while deleting message",
      error: error.message,
    });
  }
};

