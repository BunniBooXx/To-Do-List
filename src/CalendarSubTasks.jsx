import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams, Link } from "react-router-dom";
import "./CalendarSubTasks.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export default function CalendarSubtasksPage() {
  const { userId, calendarTaskId } = useParams();
  const [idToken, setIdToken] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [calendarTask, setCalendarTask] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
        // Verify the userId from params matches the authenticated user
        if (user.uid !== userId) {
          console.error("User ID mismatch");
          // Handle unauthorized access
        }
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const fetchCalendarTask = useCallback(async () => {
    if (!idToken || !calendarTaskId || !userId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar_tasks/task/${calendarTaskId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.data.success) {
        setCalendarTask(response.data.task || {});
      }
    } catch (error) {
      console.error("❌ Error fetching calendar task:", error);
    }
  }, [idToken, calendarTaskId, userId]);

  const fetchSubtasks = useCallback(async () => {
    if (!idToken || !calendarTaskId || !userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/subtasks/calendar/${calendarTaskId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.data.success) {
        setSubtasks(response.data.subtasks || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching calendar subtasks:", error);
      setLoading(false);
    }
  }, [idToken, calendarTaskId, userId]);

  useEffect(() => {
    if (idToken) {
      fetchCalendarTask();
      fetchSubtasks();
    }
  }, [idToken, fetchCalendarTask, fetchSubtasks]);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !calendarTaskId || !userId) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/subtasks/calendar/create`,
        { 
          calendarTaskId, 
          subtaskName: newSubtask,
          userId // Include userId in the request
        },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.success) {
        setNewSubtask("");
        setShowSubtaskForm(false);
        fetchSubtasks(); // Refresh the subtasks list
      }
    } catch (error) {
      console.error("❌ Error adding subtask:", error);
    }
  };

  const handleToggleSubtaskCompletion = async (subtaskId, completed) => {
    if (!subtaskId || !userId || !calendarTaskId) return;
    try {
      const response = await axios.put(
        `${API_BASE_URL}/subtasks/calendar/update/${calendarTaskId}/${subtaskId}`,
        { 
          completed: !completed,
          userId // Include userId in the request
        },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.success) {
        setSubtasks((prev) =>
          prev.map((s) =>
            s.subtask_id === subtaskId ? { ...s, completed: !completed } : s
          )
        );
      }
    } catch (error) {
      console.error("❌ Error updating subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!subtaskId || !userId || !calendarTaskId) return;
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/subtasks/calendar/delete/${calendarTaskId}/${subtaskId}`,
        { 
          headers: { Authorization: `Bearer ${idToken}` },
          data: { userId } // Include userId in the request body for DELETE
        }
      );

      if (response.data.success) {
        setSubtasks((prev) => prev.filter((s) => s.subtask_id !== subtaskId));
      }
    } catch (error) {
      console.error("❌ Error deleting subtask:", error);
    }
  };

  return (
    <div className="calendar-subtasks-container">
      <div className="subtasks-header">
        <Link to="/calendar" className="back-button">← Back to Calendar</Link>
        <h1 className="title">❀ {calendarTask.name || "Task"} ❀</h1>
        <p className="task-date">{calendarTask.date && new Date(calendarTask.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <button onClick={() => setShowSubtaskForm(true)} className="add-task-button">
        + Add New Subtask
      </button>

      {showSubtaskForm && (
        <div className="task-form-container">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddSubtask();
          }}>
            <input
              type="text"
              placeholder="Enter subtask name..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="task-input"
            />
            <button type="submit" className="submit-task-button">Add Subtask 🎀</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Loading your subtasks... 🎀</p>
        </div>
      ) : (
        <div className="subtasks-list">
          {subtasks.length > 0 ? (
            subtasks.map((subtask) => (
              <div key={subtask.subtask_id} className={`subtask-item ${subtask.completed ? "completed" : ""}`}>
                <span className="subtask-name">{subtask.name}</span>
                <div className="subtask-buttons">
                  <button
                    onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                    className="delete-button"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => handleToggleSubtaskCompletion(subtask.subtask_id, subtask.completed)}
                    className="complete-button"
                  >
                    {subtask.completed ? "💖" : "🤍"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-tasks">No subtasks yet! Add one above ✨</p>
          )}
        </div>
      )}
    </div>
  );
}
