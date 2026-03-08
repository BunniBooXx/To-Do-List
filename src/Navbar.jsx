import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { getFirebaseServices } from "./data/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [authInstance, setAuthInstance] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    let unsubscribe = null;

    const setupAuth = async () => {
      try {
        const { auth } = await getFirebaseServices();
        setAuthInstance(auth);

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (!currentUser) {
            setUser(null);
            return;
          }

          try {
            const idToken = await currentUser.getIdToken();
            const res = await axios.get(`${backendUrl}/users/get-current-user`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });

            setUser(res?.data?.success ? res.data.user : null);
          } catch (error) {
            console.error("Failed to get current user:", error);
            setUser(null);
          }
        });
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) {
        setShowMenu(false);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => setShowMenu(false);

  const handleLogout = async () => {
    if (!authInstance) return;

    try {
      await signOut(authInstance);
      setUser(null);
      setShowMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="pp-nav" aria-label="Main navigation">
      <div className="pp-nav__inner">
        <div className="pp-nav__left">
          <NavLink to="/" className="pp-nav__brand" onClick={closeMenu}>
            <span className="pp-nav__brandText">Petite Planner</span>
            <span className="pp-nav__brandSparkle" aria-hidden="true">
              ✨
            </span>
          </NavLink>
        </div>

        <div className="pp-nav__center">
          <div className="pp-nav__desktopLinks">
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `pp-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              📝 Tasks
            </NavLink>

            <NavLink
              to="/planner"
              className={({ isActive }) =>
                `pp-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              🗓️ Calendar
            </NavLink>
          </div>
        </div>

        <div className="pp-nav__right">
          <div className="pp-nav__desktopActions">
            {user ? (
              <button
                type="button"
                className="pp-nav__cta pp-nav__cta--soft"
                onClick={handleLogout}
              >
                🌸 Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `pp-nav__link pp-nav__link--small ${isActive ? "is-active" : ""}`
                  }
                >
                  🌸 Login
                </NavLink>

                <NavLink to="/signup" className="pp-nav__cta">
                  ✨ Sign Up
                </NavLink>
              </>
            )}
          </div>

          <div className="pp-nav__mobileWrap" ref={menuRef}>
            <button
              className={`pp-nav__toggle ${showMenu ? "is-open" : ""}`}
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={showMenu}
              aria-controls="pp-nav-mobile-dropdown"
              type="button"
            >
              <span className="pp-nav__bar" />
              <span className="pp-nav__bar" />
              <span className="pp-nav__bar" />
            </button>

            <div
              id="pp-nav-mobile-dropdown"
              className={`pp-nav__dropdown ${showMenu ? "is-visible" : ""}`}
            >
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `pp-nav__item ${isActive ? "is-active" : ""}`
                }
                onClick={closeMenu}
              >
                <span className="pp-nav__itemIcon">📝</span>
                <span>Tasks</span>
              </NavLink>

              <NavLink
                to="/planner"
                className={({ isActive }) =>
                  `pp-nav__item ${isActive ? "is-active" : ""}`
                }
                onClick={closeMenu}
              >
                <span className="pp-nav__itemIcon">🗓️</span>
                <span>Calendar</span>
              </NavLink>

              <div className="pp-nav__divider" />

              {user ? (
                <button
                  type="button"
                  className="pp-nav__item pp-nav__itemBtn"
                  onClick={handleLogout}
                >
                  <span className="pp-nav__itemIcon">🌸</span>
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `pp-nav__item ${isActive ? "is-active" : ""}`
                    }
                    onClick={closeMenu}
                  >
                    <span className="pp-nav__itemIcon">🌸</span>
                    <span>Login</span>
                  </NavLink>

                  <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                      `pp-nav__item ${isActive ? "is-active" : ""}`
                    }
                    onClick={closeMenu}
                  >
                    <span className="pp-nav__itemIcon">✨</span>
                    <span>Sign Up</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;