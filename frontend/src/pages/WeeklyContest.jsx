import React, { useState, useContext } from "react";
import { FaTrophy, FaComment, FaUser, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { UserContext } from "../../context/userContext"; // Import user context
import "../css/WeeklyContest.css";

const WeeklyContest = () => {
  const { user } = useContext(UserContext); // Get logged-in user

  const questions = [
    { id: 1, question: "What is the LCM of 12 and 18?" },
    { id: 2, question: "Find the profit percentage if CP is $100 and SP is $120." },
    { id: 3, question: "A train travels 240 km in 4 hours. Find its speed." },
  ];

  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Function to add a comment or reply
  const handleCommentSubmit = (questionId, comment, parentId = null) => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(), // Unique ID for each comment
      username: user?.name || "Anonymous",
      text: comment,
      replies: [],
    };

    setComments((prev) => {
      const updatedComments = { ...prev };
      if (!updatedComments[questionId]) updatedComments[questionId] = [];

      if (parentId === null) {
        // Insert new comment at the beginning (latest first)
        updatedComments[questionId] = [newComment, ...updatedComments[questionId]];
      } else {
        const addReply = (commentsArray) => {
          return commentsArray.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [newComment, ...c.replies] }; // Insert reply at the beginning
            }
            return { ...c, replies: addReply(c.replies) };
          });
        };
        updatedComments[questionId] = addReply(updatedComments[questionId]);
      }
      return updatedComments;
    });
  };

  // Toggle comment visibility
  const toggleComments = (questionId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
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
            <h4><FaComment /> Comments</h4>
            <ul>
              {comments[q.id] &&
                comments[q.id]
                  .slice(0, expandedComments[q.id] ? comments[q.id].length : 3) // Limit to 3 comments initially
                  .map((c) => (
                    <CommentItem key={c.id} comment={c} questionId={q.id} onReply={handleCommentSubmit} />
                  ))}
            </ul>

            {/* Toggle Button for Show More / Less */}
            {comments[q.id] && comments[q.id].length > 3 && (
              <button className="toggle-btn" onClick={() => toggleComments(q.id)}>
                {expandedComments[q.id] ? <>Show Less <FaChevronUp /></> : <>Show More <FaChevronDown /></>}
              </button>
            )}

            <CommentInput questionId={q.id} onCommentSubmit={handleCommentSubmit} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for each comment (supports replies)
const CommentItem = ({ comment, questionId, onReply }) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <li className="comment">
      <FaUser className="user-icon" /> <strong>{comment.username}:</strong> {comment.text}
      <button className="reply-button" onClick={() => setShowReplyBox(!showReplyBox)}>
        <FaReply /> Reply
      </button>

      {showReplyBox && (
        <div className="reply-box">
          <input
            type="text"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button onClick={() => { onReply(questionId, replyText, comment.id); setReplyText(""); setShowReplyBox(false); }}>
            Post
          </button>
        </div>
      )}

      {comment.replies.length > 0 && (
        <ul className="nested-comments">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} questionId={questionId} onReply={onReply} />
          ))}
        </ul>
      )}
    </li>
  );
};

// Input field for new comments
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
      <button onClick={() => { onCommentSubmit(questionId, comment); setComment(""); }}>
        Post
      </button>
    </div>
  );
};

export default WeeklyContest;
