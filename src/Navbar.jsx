// Navbar.js
import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <div className="navbar">
      <Link to = '/' className='navbar-title'>Petite Planner</Link>
      <Link to="/tasks" className="navbar-center-button">
        <span>To-Do List</span>
      </Link>
    </div>
  );
}

export default Navbar;
