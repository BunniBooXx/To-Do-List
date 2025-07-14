import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import axios from "axios";
import { initFirebase } from "./firebase";

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
    let unsubscribe = () => {};
    (async () => {
      const { auth } = await initFirebase();
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken();
          setIdToken(token);
          setUserId(user.uid);
        } else {
          setIdToken(null);
          setUserId(null);
        }
      });
    })();
    return () => unsubscribe();
  }, []);

  const fetchCalendarTasks = useCallback(async () => {
    if (!idToken) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/calendar_tasks/all`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setTasks(res.data.tasks || {});
    } catch (e) {
      console.error("❌ Error fetching calendar tasks:", e);
    }
  }, [idToken]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const fetchTasksForDate = async (date) => {
    if (!idToken) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/calendar_tasks/date/${date}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.data.success) {
        setTasks((prev) => ({
          ...prev,
          [date]: res.data.tasks || [],
        }));
      }
    } catch (e) {
      console.error("❌ Error fetching tasks for date:", e);
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setShowTaskModal(true);
    setShowTaskForm(false);
    await fetchTasksForDate(date);
  };

const handleAddTask = async () => {
  if (!idToken) {
    setNotification("🚫 Please log in to add a task.");
    return;
  }

  if (!newTaskName.trim()) {
    setNotification("⚠️ Task name cannot be empty.");
    return;
  }

  if (!selectedDate) {
    setNotification("⚠️ No date selected.");
    return;
  }

  const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

  try {
    const createRes = await axios.post(
      `${BACKEND_URL}/tasks/create`,
      { name: newTaskName },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    const taskId = createRes?.data?.taskId;
    if (!taskId) {
      setNotification("❌ Failed to create task.");
      return;
    }

    const calendarPayload = {
      taskId,
      date: formattedDate,
      name: newTaskName
    };

    const calendarRes = await axios.post(
      `${BACKEND_URL}/calendar_tasks/add`,
      calendarPayload,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    if (!calendarRes.data.success) {
      setNotification(`❌ Calendar task failed: ${calendarRes.data.message || "unknown error"}`);
      return;
    }

    setNewTaskName("");
    fetchTasksForDate(formattedDate);
    setNotification("✅ Task added successfully!");
  } catch (e) {
    const backendError = e.response?.data || e.message;
    setNotification(`❌ Error: ${JSON.stringify(backendError)}`);
  }
};





const handleDeleteCalendarTask = async (calendarId) => {
  try {
    if (!calendarId || typeof calendarId !== "string") {
      setNotification("❌ Invalid task ID.");
      return;
    }

    await axios.delete(`${BACKEND_URL}/calendar_tasks/remove/${calendarId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    fetchTasksForDate(selectedDate);
  } catch (e) {
    setNotification(`❌ Failed to delete task`);
    console.error("❌ Error deleting task:", e.response?.data || e.message);
  }
};


 const handleCompleteCalendarTask = async (calendarId, completed) => {
  try {
    await axios.put(
      `${BACKEND_URL}/calendar_tasks/update/${calendarId}`,
      { completed: !completed },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    // Optional: Optimistically update UI without waiting for full fetch
    setTasks((prev) => {
      const updated = { ...prev };
      if (updated[selectedDate]) {
        updated[selectedDate] = updated[selectedDate].map((task) =>
          task.calendar_id === calendarId
            ? { ...task, completed: !completed }
            : task
        );
      }
      return updated;
    });

    // Then re-fetch to stay accurate
    fetchTasksForDate(selectedDate);
  } catch (e) {
    console.error("❌ Error updating task:", e);
  }
};


  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        .calendar-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #fff5f6, #ffffff);
          padding: 2rem;
        }
        .calendar {
          background: #fff;
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(255, 182, 193, 0.2);
          width: 100%;
          max-width: 800px;
        }
        .calendar-header {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .month-label {
          font-family: "Dancing Script", cursive;
          font-size: 2rem;
          color: #ffb6c1;
        }
        .month-arrow {
          background: #ffb6c1;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        .calendar-day {
          background: #fff;
          border: 2px solid #ffc0cb;
          border-radius: 0.5rem;
          aspect-ratio: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          cursor: pointer;
        }
        .calendar-day:hover {
          background: #ffe4e1;
        }
          .emoji-button {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.2rem;
            border-radius: 50%;
            transition: transform 0.2s ease;
          }

          .emoji-button:hover {
            background-color: #ffe4ec;
            transform: scale(1.1);
          }

         

         .task-actions {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .task-actions button,
          .task-actions a {
            border: none;
            background: none;
            font-size: 1rem;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            transition: all 0.2s ease;
          }

          .task-actions button:hover,
          .task-actions a:hover {
            color: #ff69b4;
          }

          /* ✅ Move this OUTSIDE */
          .subtask-button {
            background: #ffe4ec;
            border: 1px solid #ffb6c1;
            border-radius: 0.5rem;
            color: #d6336c;
            font-size: 0.9rem;
            padding: 0.4rem 0.75rem;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s ease;
          }

          .subtask-button:hover {
            background: #ffb6c1;
            color: white;
            transform: scale(1.05);
          }

        
                  
         
        .task-modal {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(8px);
          background: rgba(255, 255, 255, 0.9);
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: #fff;
          border-radius: 1rem;
          padding: 1.5rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(255, 182, 193, 0.2);
          position: relative;
        }
        .modal-content h2 {
          text-align: center;
          color: #ffb6c1;
          font-family: "Dancing Script", cursive;
        }
        .close-button {
          background: #ffb6c1;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          color: #fff;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .close-button:hover {
          background: #ff8fab;
        }
        .close-button:focus, .close-button:active {
          outline: none;
          color: #fff;
        }
        .notification {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: #ffcad4;
          color: #912f56;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 1100;
        }
        .notification button {
          background: #ffb6c1;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          color: #fff;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .add-task-button, .submit-task-button {
          background: #ffc0cb;
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
          width: 100%;
          cursor: pointer;
        }
        .task-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ffc0cb;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }
        .task-item {
          border: 1px solid #ffc0cb;
          border-radius: 0.5rem;
          padding: 0.5rem;
          margin: 0.5rem 0;
          text-align: center;
        }
        .completed {
          text-decoration: line-through;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        @media (max-width: 600px) {
          .month-label { font-size: 1.5rem; }
          .modal-content { padding: 1rem; }
        
        }
      `}</style>

      {notification && (
        <div className="notification">
          <span>{notification}</span>
          <button onClick={() => setNotification("")} className="close-button">✖</button>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar">
          <div className="calendar-header">
            <button className="month-arrow" onClick={() => setMonthView(new Date(year, month - 1, 1))}>❮</button>
            <span className="month-label">{monthView.toLocaleString("default", { month: "long" })} {year}</span>
            <button className="month-arrow" onClick={() => setMonthView(new Date(year, month + 1, 1))}>❯</button>
          </div>
          <div className="calendar-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
              return (
                <div key={i} className="calendar-day" onClick={() => handleDateClick(dateKey)}>
                  {i + 1}
                  {tasks[dateKey]?.length > 0 && <span style={{ fontSize: '0.7rem', position: 'absolute', bottom: '2px' }}>🎀</span>}
                </div>
              );
            })}
          </div>
        </div>

        {showTaskModal && (
          <div className="task-modal">
            <div className="modal-content">
              <button className="close-button" onClick={() => setShowTaskModal(false)}>✖</button>
              <h2>Tasks For {formatDate(selectedDate)}</h2>
              <button className="add-task-button" onClick={() => setShowTaskForm(true)}>+ Add New Task</button>
              {showTaskForm && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }}>
                  <input className="task-input" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Enter task name..." />
                  <button type="submit" className="submit-task-button">Add Task 🎀</button>
                </form>
              )}
             {tasks[selectedDate]?.length > 0 ? (
  tasks[selectedDate].map(task => (
    
    <div key={task.calendar_id} className="task-item">
      {/* ✅ Add dynamic className here */}
      <span className={task.completed ? "completed" : ""}>{task.name}</span>

      <div className="task-actions">
        <button onClick={() => handleDeleteCalendarTask(task.calendar_id)} className="emoji-button">🗑️</button>
        <Link to={`/calendar-subtasks/${userId}/${task.calendar_id}`} className="subtask-button">
          ✨ Add Subtasks
        </Link>
        <button
          onClick={() => handleCompleteCalendarTask(task.calendar_id, task.completed)}
          className="emoji-button"
        >
          {task.completed ? "💖" : "🤍"}
        </button>
      </div>
    </div>
  ))
) : (
  <p style={{ textAlign: "center", color: "#ff69b4" }}>No tasks yet! 🎀</p>
)}

            </div>
          </div>
        )}
      </div>
    </>
  );
}
