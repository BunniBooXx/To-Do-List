import React from "react";
import "./App.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-badge">Planning workspace</div>

        <h1 className="loading-brand">
          <span className="loading-brand__petite">Petite</span>
          <span className="loading-brand__planner">Planner</span>
        </h1>

        <p className="loading-subtitle">
          Organizing your tasks and calendar with a polished workspace experience.
        </p>

        <div className="loading-visual" aria-hidden="true">
          <div className="loading-orbit loading-orbit--outer"></div>
          <div className="loading-orbit loading-orbit--inner"></div>
          <div className="loading-core"></div>
        </div>

        <div className="loading-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <h2 className="loading-status">Loading your planner...</h2>
      </div>
    </div>
  );
}

