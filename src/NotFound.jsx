import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
      <div className="bow-decoration left">
          <span>🎀</span>
          <span>💖</span>
          <span>🎀</span>
        </div>
        <div className="bow-decoration right">
          <span>🎀</span>
          <span>💖</span>
          <span>🎀</span>
        </div>  
        <h1 className="error-code">4🎀4</h1>
        <h2 className="error-message">Oh no! Page not found</h2>
        <p className="error-description">
          The page you're looking for has wandered off to dreamland~ ✨
        </p>
        
        <div className="hearts-decoration">
          <span>💗</span>
          <span>💝</span>
          <span>💖</span>
        </div>
        
        <Link to="/" className="return-home-button">
          Take Me Home 🏡
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
