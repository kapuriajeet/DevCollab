import mongoose from "mongoose";
const mongodbConnection = await mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully..."))
  .catch((err) => {
    console.log(`Error occurred while connecting to DB -> ${err}`);
    process.exit(1);
  });

export default mongodbConnection;