import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
