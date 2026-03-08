import React, { useEffect, useState } from "react";
import TaskList from "./TaskList.jsx";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "./firebase";
import "./TasksPage.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TasksPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("route-tasks");
    return () => document.body.classList.remove("route-tasks");
  }, []);

  useEffect(() => {
    let unsubscribe = null;

    (async () => {
      try {
        const { auth } = await initFirebase();

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setUserId(null);
            setLoading(false);
            return;
          }

          try {
            const idToken = await user.getIdToken();

            const res = await axios.get(`${backendUrl}/users/get-current-user`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });

            if (res.data?.success) {
              setUserId(res.data.user.userId);
            } else {
              setUserId(null);
              console.error("Error fetching user:", res.data?.error);
            }
          } catch (error) {
            setUserId(null);
            console.error("Authentication error:", error);
          } finally {
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Firebase", err);
        setUserId(null);
        setLoading(false);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <main className="tasks-page" aria-label="Tasks page">
      <section className="tasks-stage">
        <div className="tasks-shell">
          <header className="tasks-header">
            <div className="tasks-header-copy">
              <span className="tasks-kicker">Task list</span>
              <h1 className="tasks-title">Petite Checklist</h1>
            </div>
          </header>

          <section className="tasks-panel">
            {loading ? (
              <div className="tasks-feedback">
                <p className="loading-message">✨ Loading your tasks... ✨</p>
              </div>
            ) : userId ? (
              <TaskList userId={userId} />
            ) : (
              <div className="tasks-feedback">
                <p className="login-prompt">
                  Login to unlock your planner magic! 🪄📓🎀
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}