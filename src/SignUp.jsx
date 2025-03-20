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
  const [notifications, setNotifications] = useState([]); // Stores multiple notifications
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // ✅ Show Notification Pop-ups
  const showNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove notification after 5 sec
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  };

  // ✅ Handle Email/Password Sign-Up
  const handleSignup = async (e) => {
    e.preventDefault();
    let errors = [];

    if (!username.trim()) errors.push("⚠️ Please enter a username!");
    if (!email.trim()) errors.push("📧 Email is required!");
    if (!password.trim()) errors.push("🔒 Please enter a password!");
    if (!confirmPassword.trim()) errors.push("🔄 Confirm your password!");
    if (password && confirmPassword && password !== confirmPassword)
      errors.push("❌ Passwords do not match!");
    if (password.length > 0 && password.length < 6)
      errors.push("❌ Password must be at least 6 characters!");

    // 🔹 Show all errors at once if there are any
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

      if (response.data.success) {
        showNotification(`✨ Welcome to Petite Planner, ${username}!`, "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      showNotification(`❌ ${error.response?.data?.error || error.message}`);
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
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      showNotification(`❌ ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="signup-container">
      {/* 🔹 Display Notifications */}
      <div className="notifications-wrapper">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
            <button className="close-btn" onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
              ✖
            </button>
          </div>
        ))}
      </div>

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


