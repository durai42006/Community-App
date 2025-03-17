import express from "express";
import { addComment, getComments } from "../controllers/commentController.js";

const router = express.Router();

router.post("/add", addComment); // Add a new comment
router.get("/:questionId", getComments); // Fetch comments for a question

export default router;
