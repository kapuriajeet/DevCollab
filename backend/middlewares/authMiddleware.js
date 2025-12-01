import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate("profile");
    console.log("User in isAuthenticated Middleware", user);
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = user;
    console.log("User is isAuthenticated", user);
    next();
  } catch (error) {
    console.log(`Error occurred in Auth Middleware: ${error}`);
    res.status(401).json({
      message: "Not authorized to perform this task. Please log in.",
    });
  }
}; 
