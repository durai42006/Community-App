import { Box, Typography, IconButton } from "@mui/material";
import { Reply, ContentCopy } from "@mui/icons-material";
import dayjs from "dayjs";

const truncateText = (text, maxLength = 30) => {
    return text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const ChatMessage = ({ msg, currentUserEmail, onReply }) => {
    const isOwnMessage = msg.sender_email === currentUserEmail;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(msg.content);
    };

    // Safely parse reply_to JSON
    const replyData = msg.reply_to ? JSON.parse(msg.reply_to) : null;

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isOwnMessage ? "flex-end" : "flex-start",
            maxWidth: "97%",
            mb: 1
        }}>
            <Typography variant="caption" color="gray">
                @{msg.sender_email.split("@")[0]}
            </Typography>
            <Box sx={{
                bgcolor: isOwnMessage ? "#640000" : "#000064", // Lime green for sender, pale green for receiver
                color: isOwnMessage ? "white" : "white",
                p: 1.5,
                borderRadius: isOwnMessage ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                wordWrap: "break-word",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                position: "relative",
                animation: "fadeIn 0.3s ease-in-out"
            }}>
                {replyData && replyData.content && (
                    <Typography variant="body2" sx={{
                        bgcolor: "#ffffff40",
                        p: 0.5,
                        borderRadius: 1,
                        mb: 1,
                        fontStyle: "italic"
                    }}>
                        Replying to: {truncateText(replyData.content)}
                    </Typography>
                )}
                <Typography variant="body1">{msg.content}</Typography>
                <Typography variant="caption" sx={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "12px",
                    mt: 1,
                    opacity: 0.7
                }}>
                    {dayjs(msg.created_at).format("hh:mm A")}
                </Typography>
                <IconButton size="small" sx={{ position: "absolute", top: 5, right: -30, color: "#006400" }} onClick={() => onReply(msg)}>
                    <Reply fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ position: "absolute", bottom: 5, right: -30, color: "#006400" }} onClick={copyToClipboard}>
                    <ContentCopy fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatMessage;
