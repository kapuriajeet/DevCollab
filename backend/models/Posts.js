import mongoose, { mongo } from "mongoose";
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    image: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
    commentsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", PostSchema);
export default Posts;