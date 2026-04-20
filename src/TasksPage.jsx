import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TaskList from "./TaskList.jsx";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "./firebase";
import LoadingScreen from "./LoadingScreen.jsx";
import "./TasksPage.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TasksPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("route-tasks");
    return () => {
      document.body.classList.remove("route-tasks");
      document.body.classList.remove("route-tasks-authed");
    };
  }, []);

  useEffect(() => {
    const authedClass = "route-tasks-authed";
    if (!loading && userId) {
      document.body.classList.add(authedClass);
    } else {
      document.body.classList.remove(authedClass);
    }

    return () => document.body.classList.remove(authedClass);
  }, [loading, userId]);

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

  if (loading) {
    // Delegate to the shared app-level loading screen component
    return <LoadingScreen />;
  }

  return (
    <section className="tasks-page" aria-label="Tasks workspace">
      <div className="tasks-stage">
        <div className="tasks-shell">
          <header className="tasks-hero">
            <div className="tasks-hero-inner">
              <span className="tasks-hero-badge">Execution workspace</span>
              <h1 className="tasks-title">Structured task pipeline</h1>
              <p className="tasks-subtitle">
                Capture work, move items to done, and keep execution aligned in a focused task
                workspace.
              </p>
            </div>
          </header>

          <div
            className={
              !userId ? "tasks-panel tasks-panel--compact" : "tasks-panel"
            }
          >
            {userId ? (
              <TaskList userId={userId} />
            ) : (
              <div className="tasks-feedback">
                <div className="tasks-locked" role="status">
                  <div className="tasks-locked-inner">
                    <div className="tasks-locked-iconWrap" aria-hidden="true">
                      <svg
                        className="tasks-locked-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 14.5v1.5m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V8a4 4 0 00-8 0v4h8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="tasks-locked-eyebrow">Authentication</p>
                    <h2 className="tasks-locked-title">Sign in to continue</h2>
                    <p className="tasks-locked-desc">
                      Access tasks, subtasks, and saved progress.
                    </p>
                    <div className="tasks-locked-actions">
                      <Link to="/login" className="tasks-locked-cta">
                        Sign in
                      </Link>
                      <Link to="/signup" className="tasks-locked-link">
                        Create an account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
