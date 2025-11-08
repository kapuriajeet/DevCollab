import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Blacklist from "../models/BlacklistToken.js";
import { hashPassword } from "../utils/hashPassword.js";
import UserProfile from "../models/UserProfile.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Please enter a valid password" });

    let userExists = await User.findOne({ email }).exec();

    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "Email id is taken" });

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
    console.log("User registered successfully!");
    res.status(200).json({
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
    const user = await User.findOne({ email }).exec();
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "No user found with this email id." });

    const match = bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Passwords doesn't match." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    console.log("User Loggedin successfully!");

    res.status(200).json({
      success: true,
      token: token,
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

export const deleteController = async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers.authorization.split(" ")[1];
    console.log("Inside delete Controller: ", token);
    await new Blacklist({ token }).save();
    const deletedUser = await User.findByIdAndDelete(userId).exec();
    // const deletedProfile = await.UserProfile.findByIdAndDelete()
    if (!deletedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
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
    const token = req.headers.authorization.split(" ")[1];
    await new Blacklist({ token }).save();

    return res.status(200).json({
      success: true,
      message: "User Logged out successfully!",
    });
  } catch (error) {
    console.log(`Error while logging out a user: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error while logging out a user.",
    });
  }
};
