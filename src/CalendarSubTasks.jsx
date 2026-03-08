import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { useParams, Link } from "react-router-dom";
import "./CalendarSubTasks.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export default function CalendarSubtasksPage() {
  const { calendarTaskId } = useParams();

  const [idToken, setIdToken] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [calendarTask, setCalendarTask] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  useEffect(() => {
    document.body.classList.add("route-calendar-subtasks");
    return () => document.body.classList.remove("route-calendar-subtasks");
  }, []);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          setIdToken(token);
        } catch (error) {
          console.error("❌ Error getting Firebase token:", error);
        }
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCalendarTask = useCallback(async () => {
    if (!calendarTaskId || !idToken) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/calendar_tasks/task/${calendarTaskId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setCalendarTask(response.data.task || {});
      }
    } catch (error) {
      console.error("❌ Error fetching calendar task:", error);
    }
  }, [calendarTaskId, idToken]);

  const fetchSubtasks = useCallback(async () => {
    if (!calendarTaskId || !idToken) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/subtasks/calendar/${calendarTaskId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setSubtasks(response.data.subtasks || []);
      }
    } catch (error) {
      console.error("❌ Error fetching calendar subtasks:", error);
    } finally {
      setLoading(false);
    }
  }, [calendarTaskId, idToken]);

  useEffect(() => {
    if (idToken && calendarTaskId) {
      fetchCalendarTask();
      fetchSubtasks();
    }
  }, [idToken, calendarTaskId, fetchCalendarTask, fetchSubtasks]);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !calendarTaskId || !idToken) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/subtasks/calendar/create`,
        {
          calendarTaskId,
          subtaskName: newSubtask.trim(),
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setNewSubtask("");
        setShowSubtaskForm(false);
        fetchSubtasks();
      }
    } catch (error) {
      console.error("❌ Error adding subtask:", error);
    }
  };

  const handleToggleSubtaskCompletion = async (subtaskId, completed) => {
    if (!subtaskId || !calendarTaskId || !idToken) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/subtasks/calendar/update/${calendarTaskId}/${subtaskId}`,
        { completed: !completed },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setSubtasks((prev) =>
          prev.map((subtask) =>
            subtask.subtask_id === subtaskId
              ? { ...subtask, completed: !completed }
              : subtask
          )
        );
      }
    } catch (error) {
      console.error("❌ Error updating subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    if (!subtaskId || !calendarTaskId || !idToken) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/subtasks/calendar/delete/${calendarTaskId}/${subtaskId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        setSubtasks((prev) =>
          prev.filter((subtask) => subtask.subtask_id !== subtaskId)
        );
      }
    } catch (error) {
      console.error("❌ Error deleting subtask:", error);
    }
  };

  return (
    <main className="calendar-subtasks-page" aria-label="Calendar subtasks page">
      <section className="calendar-subtasks-shell">
        <div className="calendar-subtasks-card">
          <div className="subtasks-topbar">
            <Link to="/planner" className="back-button">
              ← Back to Calendar
            </Link>
          </div>

          <h1 className="title">❀ {calendarTask.name || "Task"} ❀</h1>

          <button
            type="button"
            onClick={() => setShowSubtaskForm((prev) => !prev)}
            className="add-task-button"
          >
            {showSubtaskForm ? "− Hide Subtask Form" : "+ Add New Subtask"}
          </button>

          {showSubtaskForm && (
            <div className="task-form-container">
              <form
                className="task-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSubtask();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter subtask name..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="task-input"
                />

                <button type="submit" className="submit-task-button">
                  Add Subtask 🎀
                </button>
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
                  <div
                    key={subtask.subtask_id}
                    className={`subtask-item ${
                      subtask.completed ? "completed" : ""
                    }`}
                  >
                    <span className="subtask-name">{subtask.name}</span>

                    <div className="subtask-buttons">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                        className="delete-button"
                        aria-label="Delete subtask"
                      >
                        🗑️
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleSubtaskCompletion(
                            subtask.subtask_id,
                            subtask.completed
                          )
                        }
                        className="complete-button"
                        aria-label="Toggle subtask completion"
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
      </section>
    </main>
  );
}