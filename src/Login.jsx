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
  const navigate = useNavigate();
  const [authInstance, setAuthInstance] = useState(null);

  useEffect(() => {
    const fetchAuth = async () => {
      const { auth } = await getFirebaseServices();
      setAuthInstance(auth);
    };
    fetchAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("⚠️ Email & Password Required!");

    try {
      if (!authInstance) {
        throw new Error("Firebase Auth not initialized yet.");
      }
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const idToken = await userCredential.user.getIdToken();

      console.log("🔍 Sending ID Token to Backend...");
      const response = await axios.post(`${backendUrl}/users/login`, { idToken });

      if (response.data.success) {
        console.log(`✅ User logged in: ${response.data.user.userId}`);
        alert(`🎀 Welcome back, ${response.data.user.username}!`);
        setTimeout(() => navigate("/"), 2000);
      } else {
        alert(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Login Failed:", error);
      alert(`❌ ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!authInstance) {
        throw new Error("Firebase Auth not initialized yet.");
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      console.log("🔍 Sending Google ID Token to Backend...");
      const response = await axios.post(`${backendUrl}/users/register-google`, { idToken });

      if (response.data.success) {
        console.log(`✅ Google User logged in: ${response.data.user.userId}`);
        alert(`🎀 Welcome back, ${response.data.user.username}!`);
        setTimeout(() => navigate("/"), 2000);
      } else {
        alert(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <h2>💖 Login to Your Account 💖</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="📧 Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="🔒 Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="login-btn">Login</button>
      </form>

      <p>Or sign in with:</p>
      <button className="google-btn" onClick={handleGoogleSignIn}>
        🎀 Sign in with Google
      </button>

      <p>
        Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
