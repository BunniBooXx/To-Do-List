// src/pages/Signup.jsx
import React, { useEffect, useMemo, useState } from "react";
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

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    document.body.classList.add("route-signup");
    return () => document.body.classList.remove("route-signup");
  }, []);

  const showNotification = (message, type = "error") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const canSubmit = useMemo(() => {
    return (
      username.trim() &&
      email.trim() &&
      password.trim() &&
      confirmPassword.trim()
    );
  }, [username, email, password, confirmPassword]);

  const handleSignup = async (e) => {
    e.preventDefault();
    const errors = [];

    if (!username.trim()) errors.push("⚠️ Please enter a username!");
    if (!email.trim()) errors.push("📧 Email is required!");
    if (!password.trim()) errors.push("🔒 Please enter a password!");
    if (!confirmPassword.trim()) errors.push("🔄 Confirm your password!");
    if (password && confirmPassword && password !== confirmPassword) {
      errors.push("❌ Passwords do not match!");
    }
    if (password.length > 0 && password.length < 6) {
      errors.push("❌ Password must be at least 6 characters!");
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
        showNotification(`✨ Welcome to Petite Planner, ${username}!`, "success");
        window.setTimeout(() => navigate("/"), 1200);
      } else {
        showNotification(`❌ ${response.data?.error || "Signup failed."}`);
      }
    } catch (error) {
      showNotification(`❌ ${error.response?.data?.error || error.message}`);
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
        showNotification("✨ Successfully signed in with Google!", "success");
        window.setTimeout(() => navigate("/"), 1200);
      } else {
        showNotification(`❌ ${response.data?.error || "Google sign-in failed."}`);
      }
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      showNotification(`❌ ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <main className="signup-page" aria-label="Signup page">
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
              ✖
            </button>
          </div>
        ))}
      </div>

      <section className="signup-stage">
        <div className="signup-shell">
          <div className="signup-card">
            <header className="signup-header">
              <h1 className="signup-title">✨ Create Account ✨</h1>
              <p className="signup-subtitle">Join Petite Planner and start planning in style 💖</p>
            </header>

            <form onSubmit={handleSignup} className="signup-form">
              <label className="signup-label">
                <span className="sr-only">Username</span>
                <input
                  type="text"
                  placeholder="👤 Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="signup-input"
                  autoComplete="username"
                />
              </label>

              <label className="signup-label">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  placeholder="📧 Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="signup-input"
                  autoComplete="email"
                />
              </label>

              <label className="signup-label">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  placeholder="🔒 Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="signup-input"
                  autoComplete="new-password"
                />
              </label>

              <label className="signup-label">
                <span className="sr-only">Confirm Password</span>
                <input
                  type="password"
                  placeholder="🔄 Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="signup-input"
                  autoComplete="new-password"
                />
              </label>

              <button type="submit" className="signup-btn" disabled={!canSubmit}>
                Create Account 🌸
              </button>
            </form>

            <div className="signup-divider">
              <span>Or sign up with</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="signup-btn google-btn"
            >
              Continue with Google 💝
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;