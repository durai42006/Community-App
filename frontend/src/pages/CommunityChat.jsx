import React, { useState, useEffect, useContext, useRef } from "react";
import { Box, TextField, Button, List, IconButton, Fab } from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { UserContext } from "../../context/userContext.jsx";
import ChatMessage from "../components/ChatMessage";
import backgroundImage from "../assets/pencil.png";

const CommunityChat = () => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const chatListRef = useRef(null); // ✅ Ref for chat list
    const [showScrollButton, setShowScrollButton] = useState(false); // ✅ Show FAB when scrolled up

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: true });

            if (!error) setMessages(data);
        };

        fetchMessages();

        // Real-time listener for new messages
        const channel = supabase
            .channel("realtime-chat")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        // ✅ Scroll to bottom when new message arrives
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [messages]);

    // ✅ Scroll to latest message
    const scrollToLatestMessage = () => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    };

    // ✅ Show/hide FAB when scrolling
    const handleScroll = () => {
        if (chatListRef.current) {
            const isAtBottom = chatListRef.current.scrollHeight - chatListRef.current.scrollTop === chatListRef.current.clientHeight;
            setShowScrollButton(!isAtBottom);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: user.id,
            sender_email: user.email,
            content: newMessage,
            created_at: new Date().toISOString(),
            reply_to: replyTo ? JSON.stringify({ content: replyTo.content || "", sender: replyTo.sender_email || "" }) : null,
        };

        const { data, error } = await supabase.from("messages").insert([messageData]).select();

        if (error) {
            console.error("Error sending message:", error.message);
            return;
        }

        setMessages((prev) => [...prev, data[0]]);
        setNewMessage("");
        setReplyTo(null);

        // ✅ Scroll to latest message after sending
        scrollToLatestMessage();
    };

    return (
        <Box sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative"
        }}>
            <List
                ref={chatListRef} // ✅ Reference chat list
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    borderRadius: "10px",
                    boxShadow: "inset 0px 0px 10px rgba(0,0,0,0.1)"
                }}
                onScroll={handleScroll} // ✅ Detect scrolling
            >
                {messages.map((msg) => (
                    <ChatMessage key={msg.id || msg.created_at} msg={msg} currentUserEmail={user.email} onReply={setReplyTo} />
                ))}
            </List>

            {replyTo && (
                <Box sx={{ bgcolor: "#98FB98", p: 1, borderRadius: 2, mt: 1 }}>
                    Replying to: {replyTo.content ? (replyTo.content.length > 30 ? replyTo.content.substring(0, 30) + "..." : replyTo.content) : ""}
                </Box>
            )}

            {/* ✅ Floating Scroll to Bottom Button */}
            {showScrollButton && (
        <Fab
            color="primary"
            sx={{
                position: "absolute",
                bottom: 90, // Move higher from the Send button
                right: 20, // Keep it aligned to the right
                backgroundColor: "#4CAF50", // Softer green
                color: "white",
                width: 45, // Slightly smaller
                height: 45,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                "&:hover": { backgroundColor: "#388E3C" }, // Darker on hover
            }}
            onClick={scrollToLatestMessage}
        >
            <ArrowDownward fontSize="medium" />
        </Fab>
        )}


            <Box sx={{
                display: "flex",
                gap: 1,
                p: 2,
                bgcolor: "#1DE543",
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
                borderRadius: "0 0 10px 10px"
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{
                        bgcolor: "white",
                        borderRadius: "5px"
                    }}
                />
                <Button variant="contained" onClick={sendMessage} sx={{ bgcolor: "#FEF9F2", "&:hover": { bgcolor: "#228B22" }, color: "black" }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default CommunityChat;
