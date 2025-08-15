import jwt from "jsonwebtoken";
import Blacklist from "../models/BlacklistToken.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("AuthHeader", authHeader);
    const token = authHeader.split(" ")[1];

    const tokenExists = await Blacklist.findOne({ token }).exec();
    if (tokenExists) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      next();
    }
  } catch (error) {
    console.log(`Error occurred in Auth Middleware: ${error}`);
    res.status(500).json({
      message: "Error occurred.",
    });
  }
};
