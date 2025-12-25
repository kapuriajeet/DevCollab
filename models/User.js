import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
    refreshToken: { type: String }
  },
  { timestamps: true }
);

userSchema.pre("save", async function(next) {

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {

  return jwt.sign({
    _id: this._id,
    name: this.name,
    email: this.email
  }, process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};


userSchema.methods.generateRefreshToken = function() {

  return jwt.sign({
    _id: this._id,
  }, process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};
const User = mongoose.model("User", userSchema);
export default User;
