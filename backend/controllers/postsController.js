import Post from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// Upload Media for Posts
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0)
    throw new ApiError(400, "No Files Found");

  const uploadedMedia = [];
  console.log("Req files", req.files);

  // Loop every file and upload on Cloudinary
  // Push the files in uploadedMedia 
  for (const file of req.files) {

    const result = await uploadOnCloudinary(
      file.path,
      "devcollab/posts"
    );
    if (!result)
      throw new ApiError(500, "Media Upload Failed");
    uploadedMedia.push({
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type === "video" ? "video" : "image"
    });
  }

  console.log("In uploadMedia", uploadedMedia);

  return res.status(200).json(new ApiResponse(200, uploadedMedia, "Media uploaded successfully"));

});

// Create a Post
export const createPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userProfileId = req.user.profile._id;
  const { content, media = [], visibility = "public" } = req.body;

  // check if content and media are given
  if (!content.trim() && media.length === 0)
    throw new ApiError(400, "Post must contain text or media");

  // Check if media type is either image or video
  if (media.length > 0) {
    const isValidMedia = media.every(
      (m) => m.url && m.publicId && ["image", "video"].includes(m.type)
    );

    if (!isValidMedia)
      throw new ApiError(400, "Invalid media format");
  }

  const post = await Post.create({
    user: userId,
    userProfile: userProfileId,
    content,
    media,
    visibility
  });
  return res.status(201).json(200, post, "Post created successfully");
});

// Get All Posts for Feed
export const getAllPosts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const userId = req.user._id;

  const pipeline = [
    { $match: { visibility: "public" } },

    { $sort: { createdAt: -1 } },

    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: "userprofiles",
        localField: "userProfile",
        foreignField: "_id",
        as: "userProfile",
      },
    },
    { $unwind: "$userProfile" },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLikedByMe: { $in: [userId, "$likes"] },
      },
    },

    {
      $project: {
        likes: 0, // don’t send full likes array
        "userProfile._id": 1,
        "userProfile.username": 1,
        "userProfile.avatar": 1,
        user: 1,
        content: 1,
        media: 1,
        likesCount: 1,
        isLikedByMe: 1,
        commentCount: 1,
        createdAt: 1,
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);

  const totalPosts = await Post.countDocuments({ visibility: "public" });

  return res.status(200, {
    posts,
    currentPage: page,
    totalPages: Math.ceil(totalPosts / limit),
    hasMore: page * limit < totalPosts,
  }, "Post Fetched successfully");
});

export const getLoggedInUserPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const pipeline = [
    { $match: { user: userId } },
    { $sort: { createdAt: -1 } },

    {
      $lookup: {
        from: "userprofiles",
        localField: "userProfile",
        foreignField: "_id",
        as: "userProfile",
      },
    },
    { $unwind: "$userProfile" },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },

    {
      $project: {
        likes: 0,
        "userProfile.username": 1,
        "userProfile.avatar": 1,
        content: 1,
        media: 1,
        likesCount: 1,
        commentCount: 1,
        createdAt: 1,
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);

  return res.status(200, posts, "User Posts received");
});

// Get Posts for a Particular User
export const getUserPost = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId);

  const pipeline = [
    { $match: { user: userId } },
    { $sort: { createdAt: -1 } },

    {
      $lookup: {
        from: "userprofiles",
        localField: "userProfile",
        foreignField: "_id",
        as: "userProfile",
      },
    },
    { $unwind: "$userProfile" },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },

    {
      $project: {
        likes: 0,
        "userProfile.username": 1,
        "userProfile.avatar": 1,
        content: 1,
        media: 1,
        likesCount: 1,
        commentCount: 1,
        createdAt: 1,
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);

  if (posts.length === 0)
    throw new ApiError(404, "Posts not found");

  return res.status(200, posts, "User Post received");
});


// Get Single Post By Id
export const getPostById = asyncHandler(async (req, res) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId);
  const userId = req.user._id;

  const pipeline = [
    { $match: { _id: postId } },

    {
      $lookup: {
        from: "userprofiles",
        localField: "userProfile",
        foreignField: "_id",
        as: "userProfile",
      },
    },
    { $unwind: "$userProfile" },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLikedByMe: { $in: [userId, "$likes"] },
      },
    },

    {
      $project: {
        likes: 0,
        "userProfile.username": 1,
        "userProfile.avatar": 1,
        content: 1,
        media: 1,
        likesCount: 1,
        isLikedByMe: 1,
        commentCount: 1,
        createdAt: 1,
      },
    },
  ];

  const post = await Post.aggregate(pipeline);

  if (!post.length) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200, post[0], "Single Post received");

});


// Delete a Post
export const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId).populate("userProfile", "username avatar");

  if (post.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }
  if (!post)
    throw new ApiError(404, "Post Not Found");

  for (const media of post.media) {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "video" ? "video" : "image"
    });
  }
  await post.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});


// Like or Unlike a Post
export const likeOrUnlikePost = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post)
    throw new ApiError(404, "Post Not Found");

  const alreadyLiked = post.likes.includes(userId);
  let updatedPost;

  // Like or Unlike Logic
  // if not already liked, then like the post
  // else unlike the post
  if (!alreadyLiked) {
    updatedPost = await Post.findByIdAndUpdate(postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  } else {
    updatedPost = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });
  }
  return res.status(200).json(new ApiResponse(200, updatedPost.likes.length, alreadyLiked ? "Post unliked" : "Post liked"));
});
