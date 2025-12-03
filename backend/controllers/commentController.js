import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
export const createComment = async (req, res) => {
  try {

    const userId = req.user._id;
    const { postId, content } = req.body;

    if (!postId || !userId) return res.status(404).json({ success: false, message: "Error occurred while adding a post. User or Post not found." });
    const comment = new Comment({
      post: postId,
      user: userId,
      content,
    });
    await comment.save();
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(200).json({ success: true, message: "Comment Created.", comment });
  } catch (error) {
    console.log(`Error while creating a comment: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while creating a comment",
    });
  }
};


export const getCommentsByPost = async (req, res) => {
  try {

    const postId = req.params.postId;
    const post = await Post.findById(postId).lean();
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    const comments = await Comment.find({ post: postId }).populate("userProfile", "username avatar").sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, message: "Comment fetched for a post", comments });
  } catch (error) {
    console.log(`Error while getting a comment by post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while getting a comment by post",
    });

  }
};


export const updateComment = async (req, res) => {
  try {

    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== req.user._id) return res.status(403).json({ success: false, message: "Not authorized to edit comment." });

    comment.content = req.body.content || comment.content;

    await comment.save();
    res.status(200).json({ success: true, message: "Comment edited successfully.", comment });
  } catch (error) {
    console.log(`Error while creating a post: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while updating a comment ",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== req.user._id) return res.status(403).json({ success: false, message: "Not authorized to delete comment." });

    await Comment.deleteOne();
    await Post.findById(comment.post, { $inc: { commentCount: -1 } });

    res.status(200).json({ success: true, message: "Comment Deleted successfully." });

  } catch (error) {
    console.log(`Error while deleting a comment: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while deleting a comment ",
    });

  }
};


export const likeOrUnlikeComment = async (req, res) => {
  try {

    const userId = req.user._id;
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment Not Found" });

    const alreadyLiked = comment.likes.includes(userId);

    let updatedComment;
    if (!alreadyLiked) {
      updatedComment = await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } }, { new: true });
    } else {

      updatedComment = await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } }, { new: true });
    }

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment Unliked" : "Comment Liked",
      likesCount: comment.likes.length,
      comment: updatedComment
    });
  } catch (error) {
    console.log(`Error while liking/unliking a comment: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while liking/unliking a comment ",
    });


  }
};
