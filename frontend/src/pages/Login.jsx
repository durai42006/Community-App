import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../supabaseClient"; // Import Supabase client
import { UserContext } from "../../context/userContext.jsx";
import "../css/Login.css";

function Login() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const loginUser = async (e) => {
        e.preventDefault();
        const { email, password } = data;

        console.log("🚀 Sending login request...");

        try {
            // Step 1: Authenticate the user
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

            if (authError) {
                console.error("❌ Login error:", authError.message);
                toast.error(authError.message);
                return;
            }

            const userId = authData.user.id; // Get authenticated user ID
            console.log("✅ User authenticated, fetching additional details...");

            // Step 2: Fetch user details from the manually created 'users' table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, username, email") // ✅ Ensure correct columns
                .eq("email", email) // ✅ Use 'id' instead of 'user_id'
                .single();

            if (userError || !userData) {
                console.error("❌ Failed to fetch user details:", userError?.message);
                toast.error("User details not found.");
                return;
            }

            console.log("✅ User details fetched:", userData);

            // Step 3: Update UserContext with user data from 'users' table
            setUser(userData);

            setData({ email: "", password: "" });
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Unexpected error:", err.message);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={loginUser} className="login-form">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
