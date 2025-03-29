import React, { useState, useEffect, useContext } from "react";
import { FaTrophy, FaComment, FaUser, FaChevronDown, FaChevronUp, FaThumbsUp, FaTrash } from "react-icons/fa";
import { UserContext } from "../../context/userContext";
import { supabase } from "../../supabaseClient"; // Import Supabase client
import "../css/WeeklyContest.css";

const WeeklyContest = () => {
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());

  const questions = [
    { id: 1, question: "What is the LCM of 12 and 18?" },
    { id: 2, question: "Find the profit percentage if CP is $100 and SP is $120." },
    { id: 3, question: "A train travels 240 km in 4 hours. Find its speed." },
  ];

  useEffect(() => {
    questions.forEach((q) => fetchComments(q.id));

    // Real-time subscription for comments
    const subscription = supabase
      .channel("comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, (payload) => {
        const { new: newComment, old: deletedComment } = payload;

        if (newComment) {
          setComments((prev) => ({
            ...prev,
            [newComment.question_id]: [newComment, ...(prev[newComment.question_id] || [])],
          }));
        }

        if (deletedComment) {
          setComments((prev) => ({
            ...prev,
            [deletedComment.question_id]: prev[deletedComment.question_id]?.filter((c) => c.id !== deletedComment.id) || [],
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchComments = async (questionId) => {
    const { data, error } = await supabase.from("comments").select("*").eq("question_id", questionId);
    if (error) console.error("Failed to fetch comments:", error);
    else setComments((prev) => ({ ...prev, [questionId]: data }));
  };

  const handleCommentSubmit = async (questionId, commentText) => {
    if (!commentText.trim()) return;

    const newComment = {
      question_id: questionId,
      username: user?.name || "Anonymous",
      text: commentText,
      likes: 0,
    };

    const { error } = await supabase.from("comments").insert([newComment]);
    if (error) console.error("Failed to add comment:", error);
  };

  const handleLike = async (questionId, commentId, currentLikes) => {
    if (likedComments.has(commentId)) return;

    const { error } = await supabase.from("comments").update({ likes: currentLikes + 1 }).eq("id", commentId);
    if (!error) setLikedComments((prev) => new Set(prev).add(commentId));
  };

  const handleDelete = async (questionId, commentId) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) console.error("Failed to delete comment:", error);
  };

  return (
    <div className="weekly-contest-container">
      <h1 className="contest-title">
        <FaTrophy className="icon-trophy" /> Weekly Aptitude Contest
      </h1>
      {questions.map((q) => (
        <div key={q.id} className="question-card">
          <h3>{q.question}</h3>
          <div className="comment-section">
            <h4>
              <FaComment /> Comments
            </h4>
            <div className="comment-list scrollable-comments">
              {comments[q.id] &&
                comments[q.id]
                  .slice(0, expandedComments[q.id] ? comments[q.id].length : 3)
                  .map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      questionId={q.id}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      liked={likedComments.has(c.id)}
                    />
                  ))}
            </div>

            {comments[q.id] && comments[q.id].length > 3 && (
              <button
                className="toggle-btn"
                onClick={() =>
                  setExpandedComments((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                }
              >
                {expandedComments[q.id] ? (
                  <>
                    Show Less <FaChevronUp />
                  </>
                ) : (
                  <>
                    Show More <FaChevronDown />
                  </>
                )}
              </button>
            )}

            <CommentInput questionId={q.id} onCommentSubmit={handleCommentSubmit} />
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentItem = ({ comment, questionId, onLike, onDelete, liked }) => {
  return (
    <div className="comment">
      <FaUser className="user-icon" /> <strong>{comment.username}:</strong> {comment.text}
      <div className="comment-actions">
        <button
          className="like-btn"
          onClick={() => onLike(questionId, comment.id, comment.likes)}
          style={{ color: liked ? "red" : "black" }}
        >
          <FaThumbsUp /> {comment.likes}
        </button>
        <button className="delete-btn" onClick={() => onDelete(questionId, comment.id)} style={{ color: "red" }}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const CommentInput = ({ questionId, onCommentSubmit }) => {
  const [comment, setComment] = useState("");

  return (
    <div className="comment-input">
      <input
        type="text"
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        onClick={() => {
          onCommentSubmit(questionId, comment);
          setComment("");
        }}
      >
        Post
      </button>
    </div>
  );
};

export default WeeklyContest;
