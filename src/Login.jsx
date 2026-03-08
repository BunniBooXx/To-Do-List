// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import "./Login.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authInstance, setAuthInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("route-login");
    return () => document.body.classList.remove("route-login");
  }, []);

  const showNotification = (message, type = "error") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5500);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { auth } = await getFirebaseServices();
        if (!mounted) return;
        setAuthInstance(auth);
      } catch (err) {
        console.error("❌ Firebase Auth Initialization Error:", err);
        if (!mounted) return;
        showNotification("❌ Firebase failed to initialize.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return !isLoading && !!authInstance && !!email && !!password;
  }, [isLoading, authInstance, email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showNotification("⚠️ Email & Password Required!");
      return;
    }

    if (!authInstance) {
      showNotification("⚠️ Firebase is still initializing. Please wait...");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        authInstance,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken(true);

      const response = await axios.post(`${backendUrl}/users/login`, { idToken });

      if (response.data?.success) {
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        window.setTimeout(() => navigate("/"), 900);
      } else {
        showNotification(`❌ ${response.data?.error || "Login failed."}`);
      }
    } catch (error) {
      const code = error?.code;

      if (code === "auth/user-not-found") {
        showNotification("❌ No account found with this email. Please sign up first!");
      } else if (code === "auth/wrong-password") {
        showNotification("❌ Incorrect password. Please try again!");
      } else if (code === "auth/invalid-credential") {
        showNotification("❌ Invalid credentials. Please try again.");
      } else {
        showNotification(`❌ ${error?.message || "Something went wrong."}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!authInstance) {
      showNotification("⚠️ Firebase is still initializing. Please wait...");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${backendUrl}/users/register-google`, {
        username: result.user.displayName || "GoogleUser",
        email: result.user.email,
        idToken,
      });

      if (response.data?.success) {
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        window.setTimeout(() => navigate("/"), 900);
      } else {
        showNotification(`❌ ${response.data?.error || "Google sign-in failed."}`);
      }
    } catch (error) {
      showNotification(
        `❌ ${error?.response?.data?.error || error?.message || "Google sign-in failed."}`
      );
    }
  };

  return (
    <main className="login-page" aria-label="Login page">
      <div className="login-notifs" aria-live="polite" aria-atomic="true">
        {notifications.map((n) => (
          <div key={n.id} className={`login-notif ${n.type}`}>
            <span className="login-notif-text">{n.message}</span>
            <button
              type="button"
              className="login-notif-x"
              onClick={() => dismissNotification(n.id)}
              aria-label="Dismiss notification"
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      <section className="login-stage">
        <div className="login-shell" aria-label="Login shell">
          <div className="login-card" aria-label="Login card">
            <header className="login-header">
              <h1 className="login-title">💖 Login 💖</h1>
              <p className="login-subtitle">Welcome back to Petite Planner ✨</p>
            </header>

            {isLoading ? (
              <p className="login-loading">⏳ Loading...</p>
            ) : (
              <form onSubmit={handleLogin} className="login-form">
                <label className="login-label">
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    placeholder="📧 Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="login-label">
                  <span className="sr-only">Password</span>
                  <input
                    type="password"
                    placeholder="🔒 Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <button type="submit" className="login-btn" disabled={!canSubmit}>
                  Login 🌸
                </button>
              </form>
            )}

            <div className="login-divider">
              <span>Or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || !authInstance}
              className="login-btn google"
            >
              🎀 Sign in with Google
            </button>

            <p className="login-footer-text">
              Don’t have an account?{" "}
              <Link className="login-link" to="/signup">
                Sign up ✨
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}