import { supabase } from "../config/supabaseClient.js";

// Add a new comment
export const addComment = async (req, res) => {
    try {
        const { question_id, text, user_id } = req.body;
        if (!question_id || !text || !user_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from("comments")
            .insert([{ question_id, text, user_id }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

// Get comments for a question
export const getComments = async (req, res) => {
    try {
        const { questionId } = req.params;

        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("question_id", questionId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

// Like a comment
export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Fetch current likes
        const { data: comment, error: fetchError } = await supabase
            .from("comments")
            .select("likes")
            .eq("id", commentId)
            .single();

        if (fetchError || !comment) return res.status(404).json({ message: "Comment not found" });

        // Update likes count
        const { data, error } = await supabase
            .from("comments")
            .update({ likes: comment.likes + 1 })
            .eq("id", commentId)
            .select();

        if (error) throw error;

        res.status(200).json({ message: "Comment liked", updatedComment: data[0] });
    } catch (error) {
        res.status(500).json({ message: "Error liking comment", error: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) throw error;

        res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};
