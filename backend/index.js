import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { supabase } from "./config/supabaseClient.js";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

// ✅ Check Supabase Connection
(async () => {
    const { data, error } = await supabase.from("comments").select("*").limit(1);
    if (error) {
        console.error("❌ Supabase connection failed:", error.message);
        process.exit(1); // Stop server if connection fails
    } else {
        console.log("✅ Supabase connected successfully!");
    }
})();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);







app.get("/messages", async (req, res) => {
    const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, user_id")
        .order("created_at", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
});

// 📌 API to send a message
app.post("/messages", async (req, res) => {
    const { user_id, content } = req.body;

    const { data, error } = await supabase
        .from("messages")
        .insert([{ user_id, content }])
        .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data[0]);
});








// Socket.IO Handling for Realtime Comments
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("newComment", async ({ questionId, comment, userId }) => {
        const { data, error } = await supabase
            .from("comments")
            .insert([{ question_id: questionId, content: comment, user_id: userId }]);
        
        if (!error) io.emit("updateComments", { questionId, comment: data });
    });

    socket.on("likeComment", async ({ commentId }) => {
        const { data, error } = await supabase
            .from("comments")
            .update({ likes: supabase.raw("likes + 1") })
            .eq("id", commentId)
            .single();
        
        if (!error) io.emit("commentLiked", { commentId, likes: data.likes });
    });

    socket.on("deleteComment", async ({ commentId }) => {
        await supabase.from("comments").delete().eq("id", commentId);
        io.emit("commentDeleted", { commentId });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start the server
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
