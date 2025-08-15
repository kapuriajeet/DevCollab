import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
  },
  { timestamps: true }
);

const  User = mongoose.model("User", UserSchema);
export default User;