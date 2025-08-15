import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: { type: String },
    skills: [{ type: String }],
    address: { type: String },
    bio: { type: String },
    socialLinks: {
      github: String,
      twitter: String,
      linkedin: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;