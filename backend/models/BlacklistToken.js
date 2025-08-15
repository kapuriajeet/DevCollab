import mongoose from "mongoose";

const BlacklistSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Blacklist = mongoose.model("Blacklist", BlacklistSchema);
export default Blacklist;
