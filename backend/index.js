import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routers/auth.js";
import mongodbConnection from "./db/connection.js";
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
const PORT = process.env.PORT;

mongodbConnection;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
