import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
}, { _id: false });


const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  userProfile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true, index: true },
  content: { type: String, trim: true, maxlength: 2000 },
  media: [MediaSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commentCount: { type: Number, default: 0 },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
},
  { timestamps: true });

// Indexes for feed & pagination
PostSchema.index({ createdAt: -1 });
PostSchema.index({ userProfile: 1, createdAt: -1 });

PostSchema.plugin(mongooseAggregatePaginate);
const Post = mongoose.model("Post", PostSchema);
export default Post;
