import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // ✅ Named Import
import "../css/Home.css";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Aptex</h1>
        {/* {user ? <h2>Hello, {user.name}!</h2> : <p>Your go-to platform for mastering aptitude skills!</p>} */}
      </header>

      <section className="home-content">
        <h2>Why Choose Aptex?</h2>
        <p>
          Aptex is an advanced platform designed to enhance your problem-solving
          and logical reasoning skills. Whether you're preparing for competitive
          exams, job placements, or simply want to improve your aptitude, we've got
          you covered!
        </p>
      </section>

      <section className="home-features">
        <h2>Features of Aptex</h2>
        <ul>
          <li>🧠 Logical Reasoning & Quantitative Aptitude</li>
          <li>📊 Real-time Mock Tests & Performance Analysis</li>
          <li>📚 Interactive Study Materials & Video Tutorials</li>
          <li>🏆 Gamified Learning with Leaderboards</li>
          <li>💡 AI-Powered Personalized Learning Paths</li>
        </ul>
      </section>

      <footer className="home-footer">
        <p>Start your learning journey with Aptex today!</p>
      </footer>
    </div>
  );
}

export default Home;
