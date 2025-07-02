import React, { useEffect, useState } from "react";
import TaskList from "./TaskList.jsx";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "./firebase"; // Import your initFirebase
import "./TasksPage.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function TasksPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    async function setupAuth() {
      try {
        const { auth } = await initFirebase();

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.error("❌ No authenticated user found.");
            setLoading(false);
            return;
          }

          try {
            const idToken = await user.getIdToken();

            const res = await axios.get(`${backendUrl}/users/get-current-user`, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });

            if (res.data.success) {
              setUserId(res.data.user.userId);
            } else {
              console.error("❌ Error fetching user:", res.data.error);
            }
          } catch (error) {
            console.error("❌ Authentication error:", error);
          }

          setLoading(false);
        });
      } catch (err) {
        console.error("❌ Failed to initialize Firebase", err);
        setLoading(false);
      }
    }

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="tasks-page">
      <div className="decorative-bow left"></div>
      <div className="decorative-bow right"></div>
      <h1 className="tasks-title">
        <span className="title-emoji">✧</span>
        Petite Checklist
        <span className="title-emoji">✧</span>
      </h1>

      {loading ? (
        <p className="loading-message">✨ Loading your tasks... ✨</p>
      ) : userId ? (
        <TaskList userId={userId} />
      ) : (
        <p className="login-prompt">Login to unlock your planner magic! 🪄📓🎀</p>
      )}
    </div>
  );
}

export default TasksPage;
