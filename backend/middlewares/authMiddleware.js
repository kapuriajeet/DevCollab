import jwt from "jsonwebtoken";
import Blacklist from "../models/BlacklistToken.js";
import User from "../models/User.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    const tokenExists = await Blacklist.findOne({ token }).exec();
    if (tokenExists) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await User.findById(decoded.id).populate("profile");
      if (!user) return res.status(404).json({ message: "User not found" });
      req.user = user;
      next();
    }
  } catch (error) {
    console.log(`Error occurred in Auth Middleware: ${error}`);
    res.status(500).json({
      message: "Not authorized to perform this task. Please log in.",
    });
  }
};
