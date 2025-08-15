import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    googleId: { type: String },
    githubId: { type: String },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
  },
  { timestamps: true }
);

export const  User = mongoose.model("User", UserSchema);