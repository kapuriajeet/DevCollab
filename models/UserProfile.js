import mongoose from "mongoose";
const UserProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
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


// Indexes for performance
UserProfileSchema.index({ followers: 1 });
UserProfileSchema.index({ following: 1 });

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;
