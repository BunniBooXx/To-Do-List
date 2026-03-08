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
            <div className="pp-footer__brandBadge">🌸</div>

            <div className="pp-footer__brandCopy">
              <h3 className="pp-footer__brandTitle">Petite Planner</h3>
              <p className="pp-footer__brandText">
                Organize your life with charm and clarity.
              </p>
            </div>
          </section>

          <section className="pp-footer__section pp-footer__links">
            <h4 className="pp-footer__heading">Quick Links</h4>

            <nav className="pp-footer__nav">
              <Link to="/tasks" className="pp-footer__link">
                <span className="pp-footer__linkIcon">📝</span>
                <span>Tasks</span>
              </Link>

              <Link to="/planner" className="pp-footer__link">
                <span className="pp-footer__linkIcon">🗓️</span>
                <span>Calendar</span>
              </Link>

              <Link to="/signup" className="pp-footer__link">
                <span className="pp-footer__linkIcon">✨</span>
                <span>Sign Up</span>
              </Link>
            </nav>
          </section>

          <section className="pp-footer__section pp-footer__social">
            <h4 className="pp-footer__heading">Connect</h4>

            <div className="pp-footer__socialRow">
              <a
                href="https://instagram.com/petiteplanner"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="pp-footer__socialLink"
              >
                🌺
              </a>

              <a
                href="https://twitter.com/petiteplanner"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="pp-footer__socialLink"
              >
                🎀
              </a>

              <a
                href="https://pinterest.com/petiteplanner"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="pp-footer__socialLink"
              >
                💖
              </a>
            </div>
          </section>
        </div>

        <div className="pp-footer__bottom">
          <p>© {currentYear} Petite Planner. All rights reserved. ✨</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;