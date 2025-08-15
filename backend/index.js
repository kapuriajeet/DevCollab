import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import mongodbConnection from "./db/connection.js";


import authRoutes from "./routes/auth.js";
import profileRoutes from './routes/userProfile.js';

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());


const PORT = process.env.PORT;
mongodbConnection;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
