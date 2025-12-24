import { asyncHandler } from "../utils/asyncHandler.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Comment
export const createComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { postId, content } = req.body;

  if (!postId || !userId) throw new ApiError(400, "User or Post not found");

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const comment = new Comment({ post: postId, user: userId, content });
  await comment.save();

  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

  return res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment created successfully"));
});

// Get Comments by Post
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId).lean();
  if (!post) throw new ApiError(404, "Post not found");

  const comments = await Comment.find({ post: postId })
    .populate("user", "name email")
    .populate({
      path: "user",
      populate: { path: "profile", select: "username avatar" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { comments }, "Comments fetched for the post")
    );
});

// Update Comment
export const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized to edit comment");

  comment.content = req.body.content || comment.content;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});

// Delete Comment
export const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized to delete comment");

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

// Like / Unlike Comment
export const likeOrUnlikeComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const commentId = req.params.commentId;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  let updatedComment;
  if (!comment.likes.includes(userId)) {
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  } else {
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likesCount: updatedComment.likes.length,
        comment: updatedComment,
      },
      comment.likes.includes(userId) ? "Comment unliked" : "Comment liked"
    )
  );
});
