import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./Calendar.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Calendar() {
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthView, setMonthView] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  const year = monthView.getFullYear();
  const month = monthView.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // ✅ Fetch User ID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const res = await axios.post(`${BACKEND_URL}/users/get-current-user`, { idToken });
        if (res.data.success) {
          setUserId(res.data.userId);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch All Calendar Tasks
  const fetchCalendarTasks = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/calendar_tasks/${userId}`);
      setTasks(response.data.tasks || {});
    } catch (error) {
      console.error("❌ Error fetching calendar tasks:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  // ✅ Fetch Tasks for Selected Date
  const fetchTasksForDate = async (date) => {
    if (!userId || !date) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/calendar_tasks/${userId}/date/${date}`);
      if (response.data.success) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          [date]: response.data.tasks || [],
        }));
      }
    } catch (error) {
      console.error("❌ Error fetching tasks for date:", error);
    }
  };

  // ✅ Handle Date Click
  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setShowTaskModal(true);
    setShowTaskForm(false);
    fetchTasksForDate(date);
  };

  // ✅ Handle Add Task
  const handleAddTask = async () => {
    if (!newTaskName.trim() || !selectedDate) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/tasks/create`, { userId, name: newTaskName });
      if (response.data.success && response.data.taskId) {
        const taskId = response.data.taskId;
        await axios.post(`${BACKEND_URL}/calendar_tasks/add`, {
          userId,
          taskId,
          date: selectedDate,
          name: newTaskName,
        });
        setNewTaskName("");
        fetchTasksForDate(selectedDate);
      }
    } catch (error) {
      console.error("❌ Error adding task:", error);
    }
  };

  // ✅ Handle Delete Calendar Task (Fixed to Use `calendar_id`)
  const handleDeleteCalendarTask = async (calendarId) => {
    if (!calendarId) {
      console.error("❌ Attempted to delete a task with an undefined calendarId!");
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/calendar_tasks/remove/${userId}/${calendarId}`);

      if (response.data.success) {
        console.log(`✅ Calendar Task ${calendarId} deleted successfully!`);

        // ✅ Optimistically update UI
        setTasks((prevTasks) => ({
          ...prevTasks,
          [selectedDate]: prevTasks[selectedDate].filter((task) => task.calendar_id !== calendarId),
        }));

        fetchTasksForDate(selectedDate);
      } else {
        console.error("❌ Error deleting calendar task:", response.data.error);
      }
    } catch (error) {
      console.error("❌ API Error deleting calendar task:", error.message);
    }
  };

  // ✅ Handle Complete Task (Fixed to Use `calendar_id`)
  const handleCompleteCalendarTask = async (calendarId, completed) => {
    if (!calendarId) return;

    try {
      const response = await axios.put(`${BACKEND_URL}/calendar_tasks/update/${userId}/${calendarId}`, {
        completed: !completed, // Toggle completion status
      });

      if (response.data.success) {
        console.log(`✅ Task ${calendarId} marked as ${response.data.updatedTask.completed ? "completed" : "incomplete"}!`);

        // ✅ Optimistically update UI
        setTasks((prevTasks) => ({
          ...prevTasks,
          [selectedDate]: prevTasks[selectedDate].map((task) =>
            task.calendar_id === calendarId ? { ...task, completed: response.data.updatedTask.completed } : task
          ),
        }));

        fetchTasksForDate(selectedDate);
      } else {
        console.error("❌ Error updating task:", response.data.error);
      }
    } catch (error) {
      console.error("❌ API Error updating task:", error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    
    // Format as "November 15, 2023"
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  

  return (
    <div className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setMonthView(new Date(year, month - 1, 1))}>◀</button>
          <span>{monthView.toLocaleString("default", { month: "long" })} {year}</span>
          <button onClick={() => setMonthView(new Date(year, month + 1, 1))}>▶</button>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={index} className="empty-day"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${(day + 1).toString().padStart(2, '0')}`;
            return (
              <div key={day} className="calendar-day" onClick={() => handleDateClick(dateKey)}>
                {day + 1}
                {tasks[dateKey]?.length > 0 && <span className="task-indicator">🎀</span>}
              </div>
            );
          })}
        </div>
      </div>
      

      {/* ✅ Task Modal */}
      {showTaskModal && (
        <div className="task-modal">
          <div className="modal-content">
          <h2>Tasks For {formatDate(selectedDate)}</h2>

            <button onClick={() => setShowTaskForm(true)} className="add-task-button">+ Add New Task</button>

            {showTaskForm && (
              <div className="task-form-container">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTask();
                }}>
                  <input
                    type="text"
                    placeholder="Enter task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="task-input"
                  />
                  <button type="submit" className="submit-task-button">Add Task 🎀</button>
                </form>
              </div>
            )}


{tasks[selectedDate]?.length > 0 ? (
  tasks[selectedDate].map((task) => (
    <div key={task.calendar_id} className={`task-item ${task.completed ? "completed" : ""}`}>
      <span>{task.name}</span>
      <div className="task-buttons">
        <button onClick={() => handleDeleteCalendarTask(task.calendar_id)}>🗑️</button>
        <Link 
          to={`/calendar-subtasks/${userId}/${task.calendar_id}`} 
          className="subtask-button"
        >
          Add Subtasks ✨
        </Link>
        <button onClick={() => handleCompleteCalendarTask(task.calendar_id, task.completed)}>
          {task.completed ? '💖' : '🤍'}
        </button>
      </div>
    </div>
  ))
) : (
  <p>No tasks yet! 🎀</p>
)}



            <button onClick={() => setShowTaskModal(false)}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
}
