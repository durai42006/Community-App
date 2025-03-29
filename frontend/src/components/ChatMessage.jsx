import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ChatMessage = ({ msg, currentUserEmail }) => {
    const isOwnMessage = msg.sender_email === currentUserEmail;
    
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: isOwnMessage ? "flex-end" : "flex-start",
            mb: 1
        }}>
            <Typography variant="caption" color="gray">
                @{msg.sender_email.split("@")[0]}
            </Typography>
            <Box sx={{
                bgcolor: isOwnMessage ? "#bbdefb" : "#c8e6c9",
                p: 1,
                borderRadius: 2,
                maxWidth: "75%",
                wordWrap: "break-word"
            }}>
                <Typography variant="body1">{msg.content}</Typography>
                <Typography variant="caption" color="gray">
                    {dayjs(msg.created_at).format("hh:mm A")}
                </Typography>
            </Box>
        </Box>
    );
};

export default ChatMessage;
