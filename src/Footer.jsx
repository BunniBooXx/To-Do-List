import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pp-footer">
      <div className="pp-footer__shell">
        <div className="pp-footer__grid">
          <section className="pp-footer__section pp-footer__brand">
            <h3 className="pp-footer__brandTitle">Petite Planner</h3>
            <p className="pp-footer__brandText">
              A lightweight planning workspace for tasks and calendar-based scheduling.
            </p>
          </section>

          <section className="pp-footer__section pp-footer__links">
            <h4 className="pp-footer__heading">Quick Links</h4>

            <nav className="pp-footer__nav" aria-label="Quick links">
              <Link to="/tasks" className="pp-footer__link">
                Tasks
              </Link>

              <Link to="/planner" className="pp-footer__link">
                Calendar
              </Link>

              <Link to="/signup" className="pp-footer__link">
                Sign Up
              </Link>
            </nav>
          </section>

          <section className="pp-footer__section pp-footer__product">
            <h4 className="pp-footer__heading">Product</h4>

            <ul className="pp-footer__list" aria-label="Product features">
              <li>
                <span className="pp-footer__linkLike">Task Management</span>
              </li>
              <li>
                <span className="pp-footer__linkLike">Calendar View</span>
              </li>
              <li>
                <span className="pp-footer__linkLike">Responsive Layout</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="pp-footer__bottom">
          <p className="pp-footer__copy">
            Copyright © {currentYear} Petite Planner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;