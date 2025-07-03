import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://petite-planner-backend.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authInstance, setAuthInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const { auth } = await getFirebaseServices();
        setAuthInstance(auth);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Firebase Auth Initialization Error:", error);
        showNotification("❌ Firebase failed to initialize.");
        setIsLoading(false);
      }
    };
    fetchAuth();
  }, []);

  const showNotification = (message, type = "error") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 6000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return showNotification("⚠️ Email & Password Required!");
    if (!authInstance) return showNotification("⚠️ Firebase is still initializing. Please wait...");

    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      const idToken = await userCredential.user.getIdToken(true);
      const response = await axios.post(`${backendUrl}/users/login`, { idToken });

      if (response.data.success) {
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        showNotification("❌ No account found with this email. Please sign up first!");
      } else if (error.code === "auth/wrong-password") {
        showNotification("❌ Incorrect password. Please try again!");
      } else {
        showNotification(`❌ ${error.message}`);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!authInstance) return showNotification("⚠️ Firebase is still initializing. Please wait...");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${backendUrl}/users/register-google`, {
        username: result.user.displayName || "GoogleUser",
        email: result.user.email,
        idToken,
      });

      if (response.data.success) {
        showNotification(`🎀 Welcome back, ${response.data.user.username}!`, "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showNotification(`❌ ${response.data.error}`);
      }
    } catch (error) {
      showNotification(`❌ ${error.response?.data?.error || error.message}`);
    }
  };

  // Styles
  const containerStyle = {
    textAlign: "center",
    background: "linear-gradient(135deg, #ffd6e7, #ffecf2)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Josefin Sans', 'Comic Sans MS', cursive"
  };

  const headingStyle = {
    color: "#ff4d8d",
    fontFamily: "'Dancing Script', cursive",
    fontSize: "clamp(2rem, 5vw, 2.5rem)",
    marginBottom: "1rem",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(255, 77, 141, 0.2)",
    width: "100%",
    maxWidth: "350px",
  };

  const inputStyle = {
    padding: "10px",
    border: "2px solid #ff80ab",
    borderRadius: "10px",
    fontSize: "1rem",
    textAlign: "center",
  };

  const buttonStyle = {
    background: "linear-gradient(45deg, #ff80ab, #ff4d8d)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "50px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
  };

  const notifWrapperStyle = {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1000,
  };

  const notifStyle = (type) => ({
    background: type === "success" ? "#d4f8d4" : "#ffd1dc",
    color: type === "success" ? "#2b9e2b" : "#d6336c",
    padding: "12px 20px",
    borderRadius: "10px",
    boxShadow: "0 5px 10px rgba(255, 105, 180, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "1rem",
    maxWidth: "300px",
    animation: "fadeIn 0.5s ease-in-out",
  });

  return (
    <div style={containerStyle}>
      <div style={notifWrapperStyle}>
        {notifications.map((n) => (
          <div key={n.id} style={notifStyle(n.type)}>
            {n.message}
            <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}>
              ✖
            </button>
          </div>
        ))}
      </div>

      <h2 style={headingStyle}>💖 Login 💖</h2>

      {isLoading ? (
        <p>⏳ Loading Firebase Auth...</p>
      ) : (
        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="email"
            placeholder="📧 Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="🔒 Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      )}

      <p style={{ marginTop: "1rem" }}>Or sign in with:</p>
      <button onClick={handleGoogleSignIn} disabled={isLoading} style={{ ...buttonStyle, maxWidth: "350px" }}>
        🎀 Sign in with Google
      </button>
    </div>
  );
};

export default Login;
