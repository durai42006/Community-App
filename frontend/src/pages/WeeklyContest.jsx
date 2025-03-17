import React, { useState, useEffect, useContext } from "react";
import { FaTrophy, FaComment, FaUser, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { UserContext } from "../../context/userContext";
import { SocketContext } from "../../context/socketContext";
import axios from "axios";
import "../css/WeeklyContest.css";

const WeeklyContest = () => {
  const { user } = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const questions = [
    { id: 1, question: "What is the LCM of 12 and 18?" },
    { id: 2, question: "Find the profit percentage if CP is $100 and SP is $120." },
    { id: 3, question: "A train travels 240 km in 4 hours. Find its speed." },
  ];

  useEffect(() => {
    questions.forEach((q) => fetchComments(q.id));

    socket.on("updateComments", ({ questionId, comment }) => {
      setComments((prev) => ({
        ...prev,
        [questionId]: [comment, ...(prev[questionId] || [])],
      }));
    });

    return () => socket.off("updateComments");
  }, [socket]);

  const fetchComments = async (questionId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/comments/${questionId}`);
      setComments((prev) => ({ ...prev, [questionId]: res.data }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleCommentSubmit = async (questionId, commentText) => {
    if (!commentText.trim()) return;

    const newComment = {
      questionId,
      username: user?.name || "Anonymous",
      text: commentText,
    };

    try {
      const res = await axios.post("http://localhost:8000/api/comments/add", newComment);
      socket.emit("newComment", { questionId, comment: res.data }); // ✅ Broadcast to all users
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
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
                  .map((c) => <CommentItem key={c._id} comment={c} />)}
            </div>

            {comments[q.id] && comments[q.id].length > 3 && (
              <button
                className="toggle-btn"
                onClick={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [q.id]: !prev[q.id],
                  }))
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

const CommentItem = ({ comment }) => {
  return (
    <div className="comment">
      <FaUser className="user-icon" /> <strong>{comment.username}:</strong> {comment.text}
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
