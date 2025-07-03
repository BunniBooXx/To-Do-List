import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
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
            setUser(res.data.success ? res.data.user : null);
          } catch {
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
    if (authInstance) {
      try {
        await signOut(authInstance);
        setUser(null);
        navigate("/login");
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };

  const navbarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(135deg, #ffd6e6, #ffecf1)",
    padding: "1rem 2rem",
    boxShadow: "0 2px 10px rgba(255, 143, 171, 0.2)",
    zIndex: 1000,
  };

  const contentStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const brandStyle = {
    fontFamily: "'Dancing Script', cursive",
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#ff8fab",
    textDecoration: "none",
  };

  const hamburgerStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "0.4rem",
  };

  const barStyle = {
    width: "30px",
    height: "3px",
    backgroundColor: "#ff8fab",
    borderRadius: "2px",
    transition: "all 0.3s ease",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(255, 143, 171, 0.2)",
    minWidth: "220px",
    padding: "0.5rem 0",
    display: "flex",
    flexDirection: "column",
  };

  const itemStyle = {
    padding: "0.75rem 1rem",
    textDecoration: "none",
    color: "#333",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "1rem",
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
  };

  return (
    <nav style={navbarStyle}>
      <div style={contentStyle}>
        <Link to="/" style={brandStyle} onClick={() => setShowMenu(false)}>
          Petite Planner
        </Link>

        <div style={{ position: "relative" }}>
          <button
            style={hamburgerStyle}
            onClick={() => setShowMenu(prev => !prev)}
            aria-label="Menu"
          >
            <span
              style={{
                ...barStyle,
                transform: showMenu ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                ...barStyle,
                opacity: showMenu ? 0 : 1,
              }}
            />
            <span
              style={{
                ...barStyle,
                transform: showMenu ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>

          {showMenu && (
            <div style={dropdownStyle}>
              <Link to="/tasks" style={itemStyle} onClick={() => setShowMenu(false)}>📝 Tasks</Link>
              <Link to="/planner" style={itemStyle} onClick={() => setShowMenu(false)}>🗓️ Calendar</Link>
              {user ? (
                <button style={itemStyle} onClick={handleLogout}>🌸 Logout</button>
              ) : (
                <>
                  <Link to="/login" style={itemStyle} onClick={() => setShowMenu(false)}>🌸 Login</Link>
                  <Link to="/signup" style={itemStyle} onClick={() => setShowMenu(false)}>✨ Sign Up</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
