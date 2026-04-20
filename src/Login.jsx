// src/Login.jsx
import React, { useEffect, useRef, useState } from "react";
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
  const notificationTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("route-login");
    return () => document.body.classList.remove("route-login");
  }, []);

  const showNotification = (message, type = "error") => {
    const now = Date.now();
    const id = now + Math.random();

    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }

    setNotifications([{ id, message, type }]);

    notificationTimerRef.current = window.setTimeout(() => {
      setNotifications([]);
      notificationTimerRef.current = null;
    }, 5500);
  };

  const dismissNotification = (id) => {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { auth } = await getFirebaseServices();
        if (!mounted) return;
        setAuthInstance(auth);
      } catch (err) {
        console.error("Firebase Auth Initialization Error:", err);
        if (!mounted) return;
        showNotification("Firebase failed to initialize. Check your connection and try again.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const submitLabel = isLoading
    ? "Loading…"
    : !authInstance
      ? "Initializing…"
      : "Sign in";

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() && !password) {
      showNotification("Please enter your email and password.");
      return;
    }

    if (!email.trim()) {
      showNotification("Please enter your email.");
      return;
    }

    if (!password) {
      showNotification("Please enter your password.");
      return;
    }

    if (!authInstance) {
      showNotification("Firebase is still initializing. Please wait.");
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
        const name = response.data.user?.username || "there";
        showNotification(`Welcome back, ${name}. Redirecting…`, "success");
        window.setTimeout(() => navigate("/"), 900);
      } else {
        showNotification(response.data?.error || "Login failed.");
      }
    } catch (error) {
      const code = error?.code;

      if (code === "auth/user-not-found") {
        showNotification("No account found with this email. Sign up to create one.");
      } else if (code === "auth/wrong-password") {
        showNotification("Incorrect password. Please try again.");
      } else if (code === "auth/invalid-credential") {
        showNotification("Invalid credentials. Please try again.");
      } else {
        showNotification(error?.message || "Something went wrong.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!authInstance) {
      showNotification("Firebase is still initializing. Please wait.");
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
        const name = response.data.user?.username || result.user.displayName || "there";
        showNotification(`Welcome back, ${name}. Redirecting…`, "success");
        window.setTimeout(() => navigate("/"), 900);
      } else {
        showNotification(response.data?.error || "Google sign-in failed.");
      }
    } catch (error) {
      showNotification(
        error?.response?.data?.error || error?.message || "Google sign-in failed."
      );
    }
  };

  return (
    <main className="login-page" aria-label="Log in">
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
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      <section className="login-stage">
        <div className="login-stage-bg" aria-hidden="true" />
        <div className="login-shell">
          <div className="login-layout">
            <div className="login-intro">
              <p className="login-brand">Petite Planner</p>
              <h1 className="login-title">
                <span className="login-title-line">Welcome</span>{" "}
                <span className="login-title-accent">back</span>
              </h1>
              <p className="login-subtitle">
                Sign in to pick up where you left off. Your tasks and progress stay synced across devices.
              </p>
            </div>

            <div className="login-panel">
              <div className="login-card">
                {isLoading ? (
                  <p className="login-loading">Loading…</p>
                ) : (
                  <>
                    <form onSubmit={handleLogin} className="login-form" noValidate>
                      <div className="login-field">
                        <label htmlFor="login-email" className="login-field-label">
                          Email
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-input"
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="login-field">
                        <label htmlFor="login-password" className="login-field-label">
                          Password
                        </label>
                        <input
                          id="login-password"
                          type="password"
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-input"
                          autoComplete="current-password"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="login-btn login-btn-primary"
                      >
                        {submitLabel}
                      </button>
                    </form>

                    <div className="login-divider" role="separator">
                      <span>Or continue with</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || !authInstance}
                      className="login-btn login-btn-google"
                    >
                      <svg
                        className="login-google-icon"
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

                    <p className="login-footer-text">
                      Don’t have an account?{" "}
                      <Link className="login-link" to="/signup">
                        Create an account
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
