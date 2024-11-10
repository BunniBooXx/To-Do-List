// App.js
import './App.css';
import Navbar from './Navbar';
import TaskList from './TaskList';
import Calendar from './Calendar';
import Homepage from './Homepage';
import TasksPage from './TasksPage';
import Subcategory from './Subcategory'; // Import Subcategory
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/subcategory/:taskId" element={<Subcategory />} /> {/* Subcategory Route */}
          <Route path="/planner" element= {<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


