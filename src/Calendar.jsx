import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from 'react-router-dom';
import axios from "axios";
import "./Calendar.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthView, setMonthView] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState("");

  const year = monthView.getFullYear();
  const month = monthView.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCalendarTasks = useCallback(async () => {
    if (!idToken) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/calendar_tasks/all`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setTasks(response.data.tasks || {});
    } catch (error) {
      console.error("❌ Error fetching calendar tasks:", error);
    }
  }, [idToken]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const fetchTasksForDate = async (date) => {
    if (!idToken || !date) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/calendar_tasks/date/${date}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
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

  const handleDateClick = async (date) => {
    if (selectedDate === date && showTaskModal) return;
    setSelectedDate(date);
    setShowTaskModal(true);
    setShowTaskForm(false);
    await fetchTasksForDate(date);
  };

  const handleAddTask = async () => {
    if (!idToken) {
      setNotification("🚫 You must be logged in to create a task!");
      return;
    }
    if (!newTaskName.trim() || !selectedDate) return;
    try {
      const createRes = await axios.post(
        `${BACKEND_URL}/tasks/create`,
        { name: newTaskName },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (createRes.data.success && createRes.data.taskId) {
        const taskId = createRes.data.taskId;
        await axios.post(
          `${BACKEND_URL}/calendar_tasks/add`,
          {
            taskId,
            date: selectedDate,
            name: newTaskName,
          },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setNewTaskName("");
        fetchTasksForDate(selectedDate);
      }
    } catch (error) {
      console.error("❌ Error adding task:", error);
    }
  };

  const handleDeleteCalendarTask = async (calendarId) => {
    if (!calendarId) return;
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/calendar_tasks/remove/${calendarId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.success) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          [selectedDate]: prevTasks[selectedDate].filter(
            (task) => task.calendar_id !== calendarId
          ),
        }));
        fetchTasksForDate(selectedDate);
      }
    } catch (error) {
      console.error("❌ API Error deleting calendar task:", error);
    }
  };

  const handleCompleteCalendarTask = async (calendarId, completed) => {
    if (!calendarId) return;
    try {
      const response = await axios.put(
        `${BACKEND_URL}/calendar_tasks/update/${calendarId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.success) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          [selectedDate]: prevTasks[selectedDate].map((task) =>
            task.calendar_id === calendarId
              ? { ...task, completed: response.data.updatedTask.completed }
              : task
          ),
        }));
        fetchTasksForDate(selectedDate);
      }
    } catch (error) {
      console.error("❌ API Error updating task:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="calendar-container">
      <div className="calendar">
      <div className="calendar-header">
  <button
    className="month-arrow left"
    onClick={() => setMonthView(new Date(year, month - 1, 1))}
  >
    ❮
  </button>
  <span className="month-label">
    {monthView.toLocaleString("default", { month: "long" })} {year}
  </span>
  <button
    className="month-arrow right"
    onClick={() => setMonthView(new Date(year, month + 1, 1))}
  >
    ❯
  </button>
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

      {showTaskModal && (
        <div className="task-modal">
          <div className="modal-content">
            <h2>Tasks For {formatDate(selectedDate)}</h2>
            {notification && (
              <div className="notification">
                <span>{notification}</span>
                <button onClick={() => setNotification("")}>✖</button>
              </div>
            )}

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
                    <Link to={`/calendar-subtasks/${userId}/${task.calendar_id}`} className="subtask-button">
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
