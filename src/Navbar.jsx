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
  const [authInstance, setAuthInstance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuth = async () => {
      const { auth } = await getFirebaseServices();
      setAuthInstance(auth);

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            const res = await axios.get(`${backendUrl}/users/get-current-user`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });

            if (res.data.success) {
              setUser(res.data.user);
            } else {
              setUser(null);
            }
          } catch (error) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      });

      return () => unsubscribe();
    };

    fetchAuth();
  }, []);

  const handleLogout = async () => {
    try {
      if (authInstance) {
        await signOut(authInstance);
        setShowNotification(true);
        setUser(null);

        setTimeout(() => {
          setShowNotification(false);
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  const handleNavClick = () => {
    if (showMenu) setShowMenu(false);
  };

  const renderLinks = () => (
    <>
      <Link to="/tasks" className="nav-item" onClick={handleNavClick}>
        <span className="nav-icon">📝</span>
        <span>Tasks</span>
      </Link>

      <Link to="/planner" className="nav-item" onClick={handleNavClick}>
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
          <Link to="/login" className="nav-item special" onClick={handleNavClick}>
            <span className="nav-icon">🌸</span>
            <span>Login</span>
          </Link>

          <Link to="/signup" className="nav-item special" onClick={handleNavClick}>
            <span className="nav-icon">✨</span>
            <span>Sign Up</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="kawaii-navbar">
      <div className="navbar-wrapper">
        <Link to="/" className="brand" onClick={handleNavClick}>
          <span className="brand-icon">🩷</span>
          <h1 className="brand-text">Petite Planner</h1>
          <span className="brand-icon">🩷</span>
        </Link>

        <div className="desktop-nav-links">{renderLinks()}</div>

        <button className="menu-toggle" onClick={() => setShowMenu((prev) => !prev)}>
          {showMenu ? "✖️" : "🍡"}
        </button>
      </div>

      {showMenu && (
        <div className="mobile-nav-links">
          {renderLinks()}
        </div>
      )}

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
