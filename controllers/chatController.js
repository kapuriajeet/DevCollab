import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";

// Access or create a 1-to-1 chat
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Check if chat already exists between these two users
    let isChat = await Chat.find({
      isGroupChat: false,
      users: { $all: [currentUserId, userId] },
    })
      .populate("users", "name email")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name email" },
      });

    if (isChat.length > 0) {
      return res.status(200).json({
        success: true,
        chat: isChat[0],
      });
    } else {
      // Create new 1-to-1 chat
      const chatData = {
        isGroupChat: false,
        users: [currentUserId, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "name email");

      return res.status(201).json({
        success: true,
        chat: fullChat,
      });
    }
  } catch (error) {
    console.log(`Error while accessing chat: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while accessing chat",
      error: error.message,
    });
  }
};

// Get all chats for the logged-in user
export const fetchChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({ users: { $elemMatch: { $eq: currentUserId } } })
      .populate("users", "name email")
      .populate("groupAdmin", "name email")
      .populate("latestMessage")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(`Error while fetching chats: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching chats",
      error: error.message,
    });
  }
};

// Create a group chat
export const createGroupChat = async (req, res) => {
  try {
    const { chatName, users } = req.body;
    const currentUserId = req.user._id;

    if (!chatName || !users || users.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Group chat name and at least 2 users are required",
      });
    }

    // Add current user to the users array
    const allUsers = [...users, currentUserId.toString()];

    const groupChat = await Chat.create({
      chatName,
      isGroupChat: true,
      users: allUsers,
      groupAdmin: currentUserId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "name email")
      .populate("groupAdmin", "name email");

    return res.status(201).json({
      success: true,
      chat: fullGroupChat,
    });
  } catch (error) {
    console.log(`Error while creating group chat: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while creating group chat",
      error: error.message,
    });
  }
};

// Rename a group chat
export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const currentUserId = req.user._id;

    if (!chatId || !chatName) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and chat name are required",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "name email")
      .populate("groupAdmin", "name email");

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    console.log(`Error while renaming group: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while renaming group",
      error: error.message,
    });
  }
};

// Add user to group
export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user._id;

    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and user ID are required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: "This is not a group chat",
      });
    }

    // Check if user is admin or if it's not a group chat (for 1-to-1, allow adding)
    if (chat.groupAdmin?.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can add users",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "name email")
      .populate("groupAdmin", "name email");

    return res.status(200).json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    console.log(`Error while adding user to group: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while adding user to group",
      error: error.message,
    });
  }
};

// Remove user from group
export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user._id;

    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and user ID are required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: "This is not a group chat",
      });
    }

    // Check if user is admin
    if (chat.groupAdmin?.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove users",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "name email")
      .populate("groupAdmin", "name email");

    return res.status(200).json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    console.log(`Error while removing user from group: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while removing user from group",
      error: error.message,
    });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check if user is part of the chat
    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === currentUserId.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this chat",
      });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.log(`Error while deleting chat: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while deleting chat",
      error: error.message,
    });
  }
};

