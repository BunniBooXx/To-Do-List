import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./Login.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authInstance, setAuthInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]); // Store pop-up notifications
  const navigate = useNavigate();

  // ✅ Fetch Firebase Auth instance on mount
  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const { auth } = await getFirebaseServices();
        setAuthInstance(auth);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error initializing Firebase Auth:", error);
        showNotification("❌ Failed to initialize Firebase. Please try again later.");
        setIsLoading(false);
      }
    };
    fetchAuth();
  }, []);

  // ✅ Show Pop-Up Notification
  const showNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 6000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return showNotification("⚠️ Email & Password Required!");

    if (!authInstance) {
      return showNotification("⚠️ Firebase is still initializing. Please wait...");
    }

    try {
      // 🔹 Sign in with Firebase Auth first
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const idToken = await userCredential.user.getIdToken();

      console.log("🔍 Sending ID Token to Backend...");
      const response = await axios.post(`${backendUrl}/users/login`, { idToken });

      if (response.data.success) {
        console.log(`✅ User logged in: ${response.data.user.userId}`);
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Login Failed:", error);

      // 🔹 Handle common Firebase login errors
      if (error.code === "auth/user-not-found") {
        showNotification("❌ No account found with this email. Please sign up first!");
      } else if (error.code === "auth/wrong-password") {
        showNotification("❌ Incorrect password. Please try again!");
      } else if (error.code === "auth/invalid-email") {
        showNotification("❌ Please enter a valid email address!");
      } else if (error.code === "auth/too-many-requests") {
        showNotification("❌ Too many failed login attempts. Please try again later!");
      } else if (error.message.includes("Network Error")) {
        showNotification("❌ Network error. Check your internet connection and try again.");
      } else {
        showNotification(`❌ ${error.message}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!authInstance) {
      return showNotification("⚠️ Firebase is still initializing. Please wait...");
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      console.log("🔍 Sending Google ID Token to Backend...");
      const response = await axios.post(`${backendUrl}/users/register-google`, { idToken });

      if (response.data.success) {
        console.log(`✅ Google User logged in: ${response.data.user.userId}`);
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      showNotification(`❌ ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      {/* 🔹 Pop-up notifications */}
      <div className="notifications-wrapper">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
            <button
              className="close-btn"
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      <h2>💖 Login to Your Account 💖</h2>

      {isLoading ? (
        <p>⏳ Loading Firebase Auth...</p>
      ) : (
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="📧 Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="🔒 Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="login-btn">Login</button>
        </form>
      )}

      <p>Or sign in with:</p>
      <button className="google-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
        🎀 Sign in with Google
      </button>

      <p>
        Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
