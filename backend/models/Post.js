import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
});


const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userProfile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
  content: { type: String, trim: true },
  media: [MediaSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commentCount: { type: Number, default: 0 },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
},
  { timestamps: true });


const Post = mongoose.model("Post", PostSchema);
export default Post;
