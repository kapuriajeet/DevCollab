import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { hashPassword } from "../utils/hashPassword.js";
import UserProfile from "../models/UserProfile.js";


const generateAccessToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30m" });

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name, !email, !password) return res.status(400).json({ message: "Name is required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Please enter a valid password" });

    const userExists = await User.findOne({ email });

    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email already in Use" });

    const hashedPassword = await hashPassword(password);

    const profile = new UserProfile({
      username: name,
      avatar: "",
      skills: [],
      address: "",
      bio: "",
      socialLinks: {},
      followers: [],
      following: [],
    });

    await profile.save();
    const user = new User({
      name,
      email,
      password: hashedPassword,
      profile: profile._id,
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (error) {
    console.log("Error while registering user: ", error);
    return res.status(500).json({
      success: false,
      message: "Error while creating registering user.",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("profile");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "No user found with this email id." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Passwords doesn't match." });

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);
    console.log("refreshToken", refreshToken);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      message: "User Loggedin successfully!",
      accessToken,
      user,
    });
  } catch (error) {
    console.log(`Error while creating logging in user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while logging user in.",
    });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: true, message: "No refresh token" });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token)
      return res.status(401).json({ success: false, message: "Invalid Refresh token" });
    const newAccessToken = generateAccessToken(user._id);
    res.json({
      success: true, accessToken: newAccessToken
    });
  } catch (error) {
    console.log(`Error in refresh token: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while logging user in.",
    });
  }
};

export const deleteController = async (req, res) => {
  try {
    const userId = req.user._id;
    const userProfileId = req.user.profile;

    await UserProfile.findByIdAndDelete(userProfileId);
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ success: true, message: "User Deleted successfully!" });

  } catch (error) {
    console.log(`Error while deleting a user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while deleting a user.",
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: 1 } });
    }
    res.clearCookie("refreshToken").json({ success: true, message: "Logged out" });
  } catch (error) {
    res.clearCookie("refreshToken").json({ success: true, message: "Logged out" });
  }
};
