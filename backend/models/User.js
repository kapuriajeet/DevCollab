import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
    refreshToken: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
