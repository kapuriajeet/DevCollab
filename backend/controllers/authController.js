import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/hashPassword.js";

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

    const user = new User({
      name,
      email,
      password: hashedPassword,
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

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Passwords doesn't match." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      sameSite: "strict",
    });

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

    const deletedUser = await User.findByIdAndDelete(userId).exec();

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
    res.clearCookie("token", {
      httpOnly: true,
    });

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
