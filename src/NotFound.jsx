import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add("route-notfound");
    return () => document.body.classList.remove("route-notfound");
  }, []);

  return (
    <main className="nf-page" role="main">
      <section className="nf-card" aria-labelledby="nf-title">
        <div className="nf-badge">Navigation</div>

        <div className="nf-visual" aria-hidden="true">
          <div className="nf-orbit nf-orbit--outer" />
          <div className="nf-orbit nf-orbit--inner" />
          <div className="nf-core" />
        </div>

        <h1 className="nf-code">404</h1>
        <h2 className="nf-title" id="nf-title">
          Page not found
        </h2>
        <p className="nf-subtitle">
          We couldn’t find <span className="nf-path">{location.pathname}</span>.
          Try heading back to a known page.
        </p>

        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn--primary">
            Back to Home
          </Link>
          <Link to="/tasks" className="nf-btn nf-btn--secondary">
            Open Tasks
          </Link>
        </div>
      </section>
    </main>
  );
}
