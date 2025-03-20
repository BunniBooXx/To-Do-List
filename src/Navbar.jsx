import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const [authInstance, setAuthInstance] = useState(null); // Store Firebase Auth instance
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuth = async () => {
      const { auth } = await getFirebaseServices(); // ✅ Correct way to get auth
      setAuthInstance(auth);

      // ✅ Listen for auth state changes (login/logout)
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            const res = await axios.post(`${backendUrl}/users/get-current-user`, { idToken });

            if (res.data.success) {
              console.log(`✅ Navbar: User authenticated as ${res.data.userId}`);
              setUser(res.data.user); // ✅ Store full user details
            } else {
              console.error("❌ Failed to fetch user:", res.data.error);
              setUser(null);
            }
          } catch (error) {
            console.error("❌ Error fetching user:", error);
            setUser(null);
          }
        } else {
          console.warn("⚠️ User signed out.");
          setUser(null);
        }
      });

      return () => unsubscribe(); // ✅ Cleanup on unmount
    };

    fetchAuth();
  }, []);

  const handleLogout = async () => {
    try {
      if (authInstance) {
        await signOut(authInstance);
        await axios.post(`${backendUrl}/users/logout`);
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <nav className="kawaii-navbar">
      <div className="navbar-wrapper">
        <Link to="/" className="brand">
          <span className="brand-icon">🩷</span>
          <h1 className="brand-text">Petite Planner</h1>
          <span className="brand-icon">🩷</span>
        </Link>

        <button className="menu-toggle" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? "✖️" : "🍡"}
        </button>

        <div className={`nav-links ${showMenu ? "active" : ""}`}>
          <Link to="/tasks" className="nav-item">
            <span className="nav-icon">📝</span>
            <span>Tasks</span>
          </Link>

          <Link to="/planner" className="nav-item">
            <span className="nav-icon">🗓️</span>
            <span>Calendar</span>
          </Link>

          <div className="nav-divider">•°•°•°•°•</div>

          {user ? (
            <button onClick={handleLogout} className="nav-item special logout-btn">
              <span className="nav-icon">🌸</span>
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-item special">
                <span className="nav-icon">🌸</span>
                <span>Login</span>
              </Link>

              <Link to="/signup" className="nav-item special">
                <span className="nav-icon">✨</span>
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="logout-notification">
          <span>✨ Successfully logged out! See you soon! 🌸</span>
          <button onClick={() => setShowNotification(false)}>✖️</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
