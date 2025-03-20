import React from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";
import plannerImage from "./planning-girl.webp"; // Example image

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <h1 className="homepage-title">🌸 Petite Planner 🌸</h1>
        <p className="homepage-description">
          Organize your tasks, track your progress, and stay on top of your schedule with a touch of cuteness! 🎀✨
        </p>
        <img src={plannerImage} alt="Planner Preview" className="homepage-image" />
        <Link to="/planner" className="homepage-button">
          Enter Planner ✨
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
