import React from "react";
import { Link } from "react-router-dom";
import plannerImage from "./planning-girl.webp";

const Homepage = () => {
  const pageStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ffd6e7, #ffecf2)",
    padding: "5vw", // Use vw for fluid padding
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "6vw",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(255, 77, 141, 0.2)",
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const titleStyle = {
    fontSize: "clamp(2rem, 5vw, 2.5rem)", // Responsive font size
    color: "#ff4d8d",
    fontFamily: "'Dancing Script', cursive",
    marginBottom: "1rem",
  };

  const descStyle = {
    fontSize: "clamp(1rem, 3.5vw, 1.3rem)",
    color: "#cc6060",
    marginBottom: "1.5rem",
  };

  const imgStyle = {
    width: "80%", // fluid width
    maxWidth: "300px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(255, 77, 141, 0.3)",
    marginBottom: "1.5rem",
  };

  const buttonStyle = {
    display: "inline-block",
    background: "linear-gradient(45deg, #ff80ab, #ff4d8d)",
    color: "white",
    padding: "clamp(10px, 3vw, 14px) clamp(20px, 6vw, 35px)",
    borderRadius: "50px",
    fontSize: "clamp(1rem, 4vw, 1.3rem)",
    fontWeight: "bold",
    textDecoration: "none",
    boxShadow: "0 4px 10px rgba(255, 77, 141, 0.2)",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🌸 Petite Planner 🌸</h1>
        <p style={descStyle}>
          Organize your tasks, track your progress, and stay on top of your schedule with a touch of cuteness! 🎀✨
        </p>
        <img src={plannerImage} alt="Planner Preview" style={imgStyle} />
        <Link to="/planner" style={buttonStyle}>
          Enter Planner ✨
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
