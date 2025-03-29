import { supabase } from "../config/supabaseClient.js";

export const test = (req, res) => {
    res.json("Test is working with Supabase");
};

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name) return res.json({ error: "Name is required" });
        if (!password || password.length < 6)
            return res.json({ error: "Password must be at least 6 characters" });

        // ✅ Supabase signup
        const { data: signUpData, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) return res.json({ error: error.message });

        const userId = signUpData?.user?.id; // ✅ Get the user ID
        if (!userId) return res.json({ error: "Signup failed, no user ID returned" });

        // ✅ Store user in the manually created `users` table
        const { error: dbError } = await supabase
            .from("users")
            .insert([{ id: userId, name, email }]);

        if (dbError) return res.json({ error: dbError.message });

        res.json({ message: "User registered successfully", user: signUpData.user });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.json({ error: "Invalid email or password" });

        res.json({
            message: "Login successful",
            user: data.user,
            token: data.session.access_token, // Send Supabase session token
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Profile
export const getProfile = async (req, res) => {
    try {
        const { user } = await supabase.auth.getUser();
        if (!user) return res.status(401).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Logout User
export const logoutUser = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) return res.json({ error: error.message });
        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
