import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./Login.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [authInstance, setAuthInstance] = useState(null); // Store Firebase Auth instance
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuth = async () => {
      const { auth } = await getFirebaseServices();
      setAuthInstance(auth);
    };
    fetchAuth();
  }, []);

  // ✅ Show Notification
  const showNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 6000);
  };

  // ✅ Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return showNotification("⚠️ Email & Password Required!");

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
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Login Failed:", error);
      showNotification(`❌ ${error.message}`);
    }
  };

  // ✅ Handle Google Sign-In
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
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
      showNotification(`❌ ${error.message}`);
    }
  };
};
export default Login;