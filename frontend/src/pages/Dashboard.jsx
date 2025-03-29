import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import { supabase } from "../../supabaseClient"; // ✅ Import Supabase client
import WeeklyContest from "../pages/WeeklyContest";
import "../css/Dashboard.css";

function Dashboard() {
    const { user, setUser } = useContext(UserContext);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [showContest, setShowContest] = useState(false);
    const [userName, setUserName] = useState(""); // ✅ New state to store username

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error("Error fetching user:", error);
            } else if (user) {
                setUser(user);

                // ✅ Fetch username from users table
                const { data: userData, error: userError } = await supabase
                    .from("users")
                    .select("name")
                    .eq("id", user.id)
                    .single(); 

                if (userError) {
                    console.error("Error fetching username:", userError);
                } else {
                    setUserName(userData.name); // ✅ Set username
                }
            }
        };
    
        fetchUser();
    }, [setUser]);

    const aptitudeTopics = [
        { name: "Quantitative Aptitude", subtopics: ["LCM & HCF", "Percentages", "Profit & Loss", "Simple & Compound Interest", "Time & Work", "Time, Speed & Distance"] },
        { name: "Logical Reasoning", subtopics: ["Blood Relations", "Coding-Decoding", "Number Series", "Direction Sense", "Syllogisms", "Puzzles"] },
        { name: "Verbal Ability", subtopics: ["Reading Comprehension", "Sentence Correction", "Synonyms & Antonyms", "Para Jumbles", "Fill in the Blanks"] },
        { name: "Data Interpretation", subtopics: ["Bar Graphs", "Pie Charts", "Line Graphs", "Tables", "Data Sufficiency"] },
        { name: "Probability & Statistics", subtopics: ["Mean, Median, Mode", "Permutations & Combinations", "Probability", "Standard Deviation"] },
        { name: "Algebra & Geometry", subtopics: ["Quadratic Equations", "Polynomials", "Triangles & Circles", "Coordinate Geometry", "Mensuration"] },
    ];

    const toggleSubtopics = (index) => {
        setExpandedTopic(expandedTopic === index ? null : index);
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome to AptEx</h1>
            {!!user ? <h2 className="dashboard-username">Hello, {userName || "Loading..."}</h2> : <p className="dashboard-loading">Loading user...</p>}

            <button className="contest-button" onClick={() => setShowContest(!showContest)}>
                {showContest ? "Back to Dashboard" : "Go to Weekly Contest"}
            </button>

            {showContest ? (
                <WeeklyContest />
            ) : (
                <div className="topics-container">
                    {aptitudeTopics.map((topic, index) => (
                        <div key={index} className="topic-card" onClick={() => toggleSubtopics(index)}>
                            <h3>{topic.name}</h3>
                            <div className={`subtopics ${expandedTopic === index ? "show" : ""}`}>
                                {topic.subtopics.map((subtopic, subIndex) => (
                                    <p key={subIndex} className="subtopic">{subtopic}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
