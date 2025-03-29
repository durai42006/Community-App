import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../supabaseClient";  
import "../css/Signup.css";

function Signup() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const registerUser = async (e) => {
        e.preventDefault();
        const { name, email, password } = data;

        try {
            // ✅ Sign up the user (Email confirmation is OFF)
            const { data: signUpData, error } = await supabase.auth.signUp({
                email, 
                password 
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            const userId = signUpData?.user?.id;  // ✅ Get the user ID
            if (!userId) {
                toast.error("User signup failed. Try again.");
                return;
            }

            // ✅ Store user details in the `users` table
            const { error: dbError } = await supabase
                .from("users")
                .insert([{ id: userId, name, email }]);

            if (dbError) {
                toast.error(dbError.message);
                return;
            }

            setData({ name: "", email: "", password: "" });

            toast.success("Signup successful! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("❌ Signup error:", error.message);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={registerUser} className="signup-form">
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Fullname"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="signup-input"
                />
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="signup-input"
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className="signup-input"
                />
                <button type="submit" className="signup-button">Submit</button>
            </form>
        </div>
    );
}

export default Signup;
