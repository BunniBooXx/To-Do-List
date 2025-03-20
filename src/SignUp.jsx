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

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // ✅ Handle Email/Password Sign-Up
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim()) return showNotification("⚠️ Please enter a username!");
    if (!email.trim()) return showNotification("📧 Email is required!");
    if (!password.trim()) return showNotification("🔒 Please enter a password!");
    if (!confirmPassword.trim()) return showNotification("🔄 Confirm your password!");
    if (password !== confirmPassword) return showNotification("❌ Passwords do not match!");
    if (password.length < 6) return showNotification("❌ Password must be at least 6 characters!");

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


