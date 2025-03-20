import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // ✅ Show Notification Pop-Ups
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

  // ✅ Validate Email Format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ✅ Handle Email/Password Sign-Up
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim()) return showNotification("⚠️ Please enter a username!");
    if (username.length < 3) return showNotification("❌ Username must be at least 3 characters!");
    if (username.length > 20) return showNotification("❌ Username must be under 20 characters!");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return showNotification("❌ Username can only contain letters, numbers, and underscores!");

    if (!email.trim()) return showNotification("📧 Email is required!");
    if (!isValidEmail(email)) return showNotification("❌ Please enter a valid email address!");

    if (!password.trim()) return showNotification("🔒 Please enter a password!");
    if (password.length < 6) return showNotification("❌ Password must be at least 6 characters!");
    if (password.length > 20) return showNotification("❌ Password cannot exceed 20 characters!");
    if (!confirmPassword.trim()) return showNotification("🔄 Confirm your password!");
    if (password !== confirmPassword) return showNotification("❌ Passwords do not match!");
    if (password.toLowerCase().includes("password")) return showNotification("❌ Password cannot contain 'password'!");
    if (password.toLowerCase().includes(username.toLowerCase())) return showNotification("❌ Password should not contain your username!");

    try {
      const response = await axios.post(`${backendUrl}/users/register`, {
        username,
        email,
        password,
      });

      if (response.data.success) {
        showNotification(`✨ Welcome to Petite Planner, ${username}!`, "success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showNotification("❌ This email is already registered! Try logging in.");
      } else if (error.response?.status === 500) {
        showNotification("❌ Server error! Please try again later.");
      } else {
        showNotification(`❌ ${error.response?.data?.error || "Unknown error occurred!"}`);
      }
    }
  };

  // ✅ Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 🔹 Check if the user exists or register them
      const response = await axios.post(`${backendUrl}/users/register-google`, {
        username: result.user.displayName || "GoogleUser",
        email: result.user.email,
        idToken,
      });

      if (response.data.success) {
        showNotification("✨ Successfully signed in with Google!", "success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        showNotification("❌ Google sign-in popup closed before completing.");
      } else if (error.code === "auth/network-request-failed") {
        showNotification("❌ Network error! Check your internet connection.");
      } else {
        showNotification(`❌ ${error.message}`);
      }
    }
  };

  return (
    <div className="signup-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button className="close-btn" onClick={() => setNotification(null)}>✖</button>
        </div>
      )}

      <h2>✨ Create Account ✨</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="👤 Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔒 Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔄 Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="signup-btn">Create Account 🌸</button>
      </form>

      <p>Or sign up with:</p>
      <button onClick={handleGoogleSignIn} className="google-btn">Continue with Google 💝</button>
    </div>
  );
};

export default Signup;

