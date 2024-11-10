// Homepage.js
import './Homepage.css';
import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="homepage">
      <Link to="/planner" className="homepage-link">
        <span>Enter Planner</span>
      </Link>
    </div>
  );
}

export default Homepage;
