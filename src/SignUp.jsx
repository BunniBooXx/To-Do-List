// src/pages/Signup.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState([]);
  const notificationTimersRef = useRef(new Map());

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    document.body.classList.add("route-signup");
    return () => document.body.classList.remove("route-signup");
  }, []);

  const showNotification = (message, type = "error") => {
    const now = Date.now();
    let activeId = null;

    setNotifications((prev) => {
      const existing = prev.find((n) => n.message === message);
      if (existing) {
        activeId = existing.id;
        const updated = { ...existing, type, refreshedAt: now };
        const next = [...prev.filter((n) => n.id !== existing.id), updated];
        return next.slice(-3);
      }

      const id = now + Math.random();
      activeId = id;
      const next = [...prev, { id, message, type, refreshedAt: now }];
      return next.slice(-3);
    });

    // Refresh auto-dismiss timer for this message.
    window.setTimeout(() => {
      if (!activeId) return;
      const key = `${message}`;

      const existingTimer = notificationTimersRef.current.get(key);
      if (existingTimer) window.clearTimeout(existingTimer);

      const timerId = window.setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== activeId));
        notificationTimersRef.current.delete(key);
      }, 5000);

      notificationTimersRef.current.set(key, timerId);
    }, 0);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif) {
        const key = `${notif.message}`;
        const timerId = notificationTimersRef.current.get(key);
        if (timerId) window.clearTimeout(timerId);
        notificationTimersRef.current.delete(key);
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  const canSubmit = useMemo(() => {
    return Boolean(username.trim() && email.trim() && password.trim() && confirmPassword.trim());
  }, [username, email, password, confirmPassword]);

  useEffect(() => {
    const timers = notificationTimersRef.current;

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    const errors = [];

    if (!canSubmit) {
      showNotification("Please fill all input fields.");
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }
    if (password.length > 0 && password.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    if (errors.length > 0) {
      errors.forEach((err) => showNotification(err));
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/users/register`, {
        username,
        email,
        password,
      });

      if (response.data?.success) {
        showNotification(`Welcome, ${username}. Your account is ready.`, "success");
        window.setTimeout(() => navigate("/"), 1200);
      } else {
        showNotification(response.data?.error || "Signup failed.");
      }
    } catch (error) {
      showNotification(error.response?.data?.error || error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${backendUrl}/users/register-google`, {
        idToken,
        email: result.user.email,
        username: result.user.displayName || "GoogleUser",
      });

      if (response.data?.success) {
        showNotification("Signed in with Google. Redirecting…", "success");
        window.setTimeout(() => navigate("/"), 1200);
      } else {
        showNotification(response.data?.error || "Google sign-in failed.");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      showNotification(error.response?.data?.error || error.message);
    }
  };

  return (
    <main className="signup-page" aria-label="Sign up">
      <div className="signup-notifs" aria-live="polite" aria-atomic="true">
        {notifications.map((notification) => (
          <div key={notification.id} className={`signup-notif ${notification.type}`}>
            <span className="signup-notif-text">{notification.message}</span>
            <button
              type="button"
              className="signup-notif-x"
              onClick={() => dismissNotification(notification.id)}
              aria-label="Dismiss notification"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      <section className="signup-stage">
        <div className="signup-stage-bg" aria-hidden="true" />
        <div className="signup-shell">
          <div className="signup-layout">
            <div className="signup-intro">
              <p className="signup-brand">Petite Planner</p>
              <h1 className="signup-title">
                <span className="signup-title-line">Create your</span>{" "}
                <span className="signup-title-accent">account</span>
              </h1>
              <p className="signup-subtitle">
                Get started in minutes. Create tasks, track progress, and keep everything organized in one workspace.
              </p>
            </div>

            <div className="signup-panel">
              <div className="signup-card">
                <form onSubmit={handleSignup} className="signup-form" noValidate>
                  <div className="signup-field">
                    <label htmlFor="signup-username" className="signup-field-label">
                      Username
                    </label>
                    <input
                      id="signup-username"
                      type="text"
                      placeholder="Your display name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="signup-input"
                      autoComplete="username"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="signup-email" className="signup-field-label">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="signup-input"
                      autoComplete="email"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="signup-password" className="signup-field-label">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="signup-input"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="signup-field">
                    <label htmlFor="signup-confirm" className="signup-field-label">
                      Confirm password
                    </label>
                    <input
                      id="signup-confirm"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="signup-input"
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    type="button"
                    className="signup-btn signup-btn-primary"
                    onClick={handleSignup}
                  >
                    Create account
                  </button>
                </form>

                <div className="signup-divider" role="separator">
                  <span>Or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="signup-btn signup-btn-google"
                >
                  <svg
                    className="signup-google-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
