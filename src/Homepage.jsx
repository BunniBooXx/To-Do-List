import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";
import plannerPreview from "./planner-preview.png";

export default function Homepage() {
  useEffect(() => {
    document.body.classList.add("route-petite-home");
    return () => document.body.classList.remove("route-petite-home");
  }, []);

  return (
    <main className="pp-home">
      <div className="pp-home-shell">

        {/* HERO */}
        <section className="pp-hero">
          <div className="pp-hero-inner">

            <div className="pp-hero-text">
              <span className="pp-badge">Frontend Product Build</span>

              <h1 className="pp-title">
                <span className="pp-title__brand">Petite</span>{" "}
                <span className="pp-title__highlight">Planner</span>
              </h1>

              <p className="pp-description">
                A structured task and calendar system built with scalable layout,
                reusable components, and responsive UI architecture.
              </p>

              <div className="pp-actions">
                <Link to="/planner" className="pp-btn-primary">
                  Launch App
                </Link>
                <Link to="/tasks" className="pp-btn-secondary">
                  Explore Tasks
                </Link>
              </div>
            </div>

            <div className="pp-hero-visual">
              <div className="pp-browser">
                <div className="pp-browser-bar">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <img src={plannerPreview} alt="Petite Planner App Preview" />
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="pp-features">
          <div className="pp-feature">
            <h3>Component-Based Architecture</h3>
            <p>Modular UI structure with reusable layout patterns.</p>
          </div>

          <div className="pp-feature">
            <h3>Task + Subtask State Flow</h3>
            <p>Organized interaction patterns and structured state updates.</p>
          </div>

          <div className="pp-feature">
            <h3>Responsive Layout System</h3>
            <p>Adaptive grid structure optimized for mobile and desktop.</p>
          </div>
        </section>

      </div>
    </main>
  );
}