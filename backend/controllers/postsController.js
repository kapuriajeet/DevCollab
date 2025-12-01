import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Post from "../models/Post.js";
export const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });

    }

    const uploadedMedia = [];
    console.log("Req files", req.files);
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {

        folder: "devcollab/posts",
        resource_type: "auto",
        transformation: [
          { width: 1080, height: 1080, crop: "limit" },
          { fetch_format: "auto", quality: "auto" },
        ],
      });

      uploadedMedia.push({
        url: result.secure_url,
        publicId: result.public_id,
        type: file.mimetype.startsWith("video") ? "video" : "image"
      });

      console.log("In uploadMedia", uploadedMedia);
    }

    return res.status(200).json({ success: true, media: uploadedMedia });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error occurred while uploading media",
    });

  }
};
export const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content, media } = req.body;
    const post = new Post({
      user: userId,
      userProfile: req.user.profile._id,
      content,
      media
    });
    const savedPost = await post.save();
    return res.status(201).json({
      success: true,
      message: "Post added successfully",
      savedPost
    });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating post",
    });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userProfile", "username avatar").sort({ createdAt: -1 }).lean();
    if (!posts) return res.status(404).json({ success: false, message: "Post Not Found" });
    return res.status(200).json({ success: true, message: "All Posts fetched successfully", posts });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching post",
    });

  }
};

export const getLoggedInUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ user: userId }).populate("userProfile", "username avatar").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, message: "Users posts received", posts });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching post",
    });


  }
};

export const getUserPost = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId }).populate("userProfile", "username avatar").sort({ createdAt: -1 }).lean();
    if (!posts) return res.status(404).json({ success: false, message: "Posts Not Found" });
    return res.status(200).json({ success: true, message: "Users posts received", posts });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching post",
    });
  }
};


export const getPostById = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate("userProfile", "username avatar");
    if (!post) return res.status(404).json({ success: false, message: "Post Not Found" });
    return res.status(200).json({ success: true, message: "Single Post Received", post });
  } catch (error) {

    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching post",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate("userProfile", "username avatar");
    if (!post) return res.status(404).json({ success: false, message: "Post Not Found" });

    for (const media of post.media) {
      await cloudinary.uploader.destroy(media.publicId, "auto");
    }
    await post.deleteOne();
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {

    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while deleting post",
    });
  }
};

export const likeOrUnlikePost = async (req, res) => {
  try {

    const userId = req.user._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post Not Found" });

    const alreadyLiked = post.likes.includes(userId);
    let updatedPost;
    if (!alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    } else {
      updatedPost = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });
    }
    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: updatedPost.likes.length,
      post: updatedPost,
    });
  } catch (error) {

    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while deleting post",
    });

  }
};
