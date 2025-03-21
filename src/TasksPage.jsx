import React, { useEffect, useState } from "react";
import TaskList from "./TaskList.jsx";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./TasksPage.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function TasksPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (!user) {
          console.error("❌ No authenticated user found.");
          setLoading(false);
          return;
        }
  
        const idToken = await user.getIdToken(); // ✅ Get ID token
  
        const res = await axios.get(`${backendUrl}/users/get-current-user`, {
          headers: {
            Authorization: `Bearer ${idToken}`, // ✅ Send token as Bearer header
          },
        });
  
        if (res.data.success) {
          setUserId(res.data.user.userId); // ✅ It's nested under .user
        } else {
          console.error("❌ Error fetching user:", res.data.error);
        }
      } catch (error) {
        console.error("❌ Authentication error:", error);
      }
      setLoading(false);
    };
  
    fetchUser();
  }, []);
  

  return (
    <div className="tasks-page">
      <div className="decorative-bow left"></div>
      <div className="decorative-bow right"></div>
      <h1 className="tasks-title">
        <span className="title-emoji">✧༺♥༻∞</span>
        Petite Checklist
        <span className="title-emoji">✧༺♥༻∞</span>
      </h1>

      {loading ? (
        <p className="loading-message">✨ Loading your tasks... ✨</p>
      ) : userId ? (
        <TaskList userId={userId} />
      ) : (
        <p className="login-prompt">🚪 Please log in to view your tasks! 🎀</p>
      )}
    </div>
  );
}

export default TasksPage;
