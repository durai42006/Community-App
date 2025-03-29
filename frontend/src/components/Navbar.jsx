import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import "../css/Navbar.css"; // Import CSS file
import defaultAvatar from "../assets/user.png"; // Default avatar image
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx"; // Import UserContext

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(""); // Store username from 'users' table
  const navigate = useNavigate();
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);

        // Fetch username from 'users' table using 'id'
        const { data: userData, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", session.user.id) // ✅ Use 'id' instead of 'user_id'
          .single();

        if (userData) {
          setUserName(userData.username);
          setContextUser(userData); // Update UserContext
        }
        if (error) console.error("Error fetching user from 'users' table:", error);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        setUserName("");
        setContextUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserName("");
      setContextUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">AptEx</Link>
      </div>

      <div className="navbar-right">
        <Link to="/" className="navbar-link">Home</Link>

        {!user ? (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-link">Signup</Link>
            <img src={defaultAvatar} alt="Default User" className="user-avatar" />
          </>
        ) : (
          <>
            <div className="user-info">
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <img src={defaultAvatar} alt="User" className="user-avatar" />
              <span className="username">{userName || user.email}</span> {/* ✅ Display username */}
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
