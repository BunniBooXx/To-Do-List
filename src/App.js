import './App.css';
import Navbar from './Navbar.jsx';
import Calendar from './Calendar.jsx';
import Homepage from './Homepage.jsx';
import TasksPage from './TasksPage.jsx';
import CalendarSubtasksPage from './CalendarSubTasks.jsx';
import Signup from './SignUp.jsx';
import Login from './Login.jsx';
import Footer from './Footer.jsx';
import NotFound from './NotFound.jsx';
import Subcategory from './Subcategory.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  console.log("App is running!");
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <Router>
      {isLoading ? (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-bow"></div>
            <div className="loading-hearts">
              <span>💖</span>
              <span>💝</span>
              <span>💗</span>
            </div>
            <h2>Loading your kawaii planner...</h2>
          </div>
        </div>
      ) : (
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/subtasks/:taskId" element={<Subcategory />} />
              <Route path="/planner" element={<Calendar />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/calendar-subtasks/:userId/:calendarTaskId" element={<CalendarSubtasksPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </Router>
  );
}

export default App;





