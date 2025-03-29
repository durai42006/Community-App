import React, { useState, useEffect, useContext } from "react";
import { Box, TextField, Button, List } from "@mui/material";
import { supabase } from "../../supabaseClient";
import { UserContext } from "../../context/userContext.jsx";
import ChatMessage from "../components/ChatMessage";

const CommunityChat = () => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

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
                    setMessages((prev) => [...prev, payload.new]); // Append new message instantly
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: user.id,
            sender_email: user.email,
            content: newMessage,
            created_at: new Date().toISOString(), // Add timestamp for instant UI update
        };

        // Update UI instantly before sending to Supabase
        setMessages((prev) => [...prev, messageData]);

        const { error } = await supabase.from("messages").insert([messageData]);

        if (error) console.error("Error sending message:", error.message);

        setNewMessage(""); // Clear input field after sending
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 3, p: 2, boxShadow: 3, borderRadius: 2, bgcolor: "#f5f5f5" }}>
            <List sx={{ maxHeight: 400, overflowY: "auto", bgcolor: "white", p: 1, borderRadius: 2 }}>
                {messages.map((msg) => (
                    <ChatMessage key={msg.id || msg.created_at} msg={msg} currentUserEmail={user.email} />
                ))}
            </List>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button variant="contained" onClick={sendMessage}>
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default CommunityChat;
