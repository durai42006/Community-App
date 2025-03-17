import Comment from "../models/Comment.js";

// Add a new comment
export const addComment = async (req, res) => {
  try {
    const { questionId, username, text } = req.body;
    const newComment = new Comment({ questionId, username, text });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Get all comments for a question
export const getComments = async (req, res) => {
  try {
    const { questionId } = req.params;
    const comments = await Comment.find({ questionId }).sort({ createdAt: -1 }); // Latest first
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
