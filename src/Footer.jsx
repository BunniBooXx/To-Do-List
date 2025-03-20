import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🌸 Petite Planner</h3>
          <p>Organize your life with charm</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/tasks">📝 Tasks</a></li>
            <li><a href="/planner">📅 Calendar</a></li>
            <li><a href="/signup">✨ Sign Up</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="https://instagram.com/petiteplanner" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">🌺</a>
            <a href="https://twitter.com/petiteplanner" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">🎀</a>
            <a href="https://pinterest.com/petiteplanner" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Pinterest">💖</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>CopyRight © {currentYear} Petite Planner. All rights reserved. ✨</p>
      </div>
    </footer>
  );
};

export default Footer;
