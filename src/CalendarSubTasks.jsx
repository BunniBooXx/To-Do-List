import { useEffect, useState, useCallback, useMemo } from "react";
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

  const completedCount = useMemo(
    () => subtasks.filter((subtask) => subtask.completed).length,
    [subtasks]
  );

  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedCount / subtasks.length) * 100)
      : 0;

  return (
    <main
      className="calendar-subtasks-page"
      aria-label="Calendar subtasks page"
    >
      <section className="calendar-subtasks-stage">
        <div className="calendar-subtasks-shell">
          <div className="calendar-subtasks-card">
            <div className="calendar-subtasks-topbar">
              <Link to="/planner" className="calendar-back-button">
                ← Back to Calendar
              </Link>
            </div>

            <header className="calendar-subtasks-hero">
              <div className="calendar-hero-chip-row">
                <span className="calendar-hero-chip">Planner follow-up</span>
                <span className="calendar-hero-chip soft">
                  {subtasks.length} subtasks
                </span>
              </div>

              <div className="calendar-hero-main">
                <div className="calendar-hero-text">
                  <p className="calendar-hero-kicker">Calendar Task</p>
                  <h1 className="calendar-subtasks-title">
                    {calendarTask.name || "Task"}
                  </h1>
                  <p className="calendar-subtasks-subtitle">
                    Turn this scheduled task into smaller actionable steps so it
                    feels easier to finish on time.
                  </p>
                </div>

                <div className="calendar-progress-card">
                  <span className="calendar-progress-label">Progress</span>
                  <span className="calendar-progress-number">
                    {progressPercent}%
                  </span>
                  <div className="calendar-progress-track" aria-hidden="true">
                    <span
                      className="calendar-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="calendar-subtasks-stats">
                <div className="calendar-stat-card">
                  <span className="calendar-stat-label">Total Steps</span>
                  <span className="calendar-stat-value">{subtasks.length}</span>
                </div>

                <div className="calendar-stat-card">
                  <span className="calendar-stat-label">Finished</span>
                  <span className="calendar-stat-value">{completedCount}</span>
                </div>

                <div className="calendar-stat-card">
                  <span className="calendar-stat-label">Status</span>
                  <span className="calendar-stat-value">
                    {subtasks.length > 0 && completedCount === subtasks.length
                      ? "Complete"
                      : "Active"}
                  </span>
                </div>
              </div>
            </header>

            <section className="calendar-compose-card">
              <div className="calendar-compose-header">
                <div>
                  <p className="calendar-section-kicker">Add a step</p>
                  <h2 className="calendar-section-title">Build the breakdown</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubtaskForm((prev) => !prev)}
                  className="calendar-toggle-form-button"
                >
                  {showSubtaskForm ? "Hide form" : "New subtask"}
                </button>
              </div>

              {showSubtaskForm && (
                <div className="calendar-task-form-container">
                  <form
                    className="calendar-task-form"
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
                      className="calendar-task-input"
                    />

                    <button
                      type="submit"
                      className="calendar-submit-task-button"
                    >
                      Add to Calendar Plan
                    </button>
                  </form>
                </div>
              )}
            </section>

            <section className="calendar-list-card">
              <div className="calendar-list-header">
                <div>
                  <p className="calendar-list-kicker">Subtasks</p>
                  <h2 className="calendar-list-title">Scheduled action list</h2>
                </div>

                <span className="calendar-list-count">
                  {subtasks.length} items
                </span>
              </div>

              {loading ? (
                <div className="calendar-state-card">
                  <p className="calendar-state-title">
                    Loading your subtasks... 🎀
                  </p>
                  <p className="calendar-state-subtitle">
                    Pulling in the latest planner details.
                  </p>
                </div>
              ) : subtasks.length > 0 ? (
                <div className="calendar-subtasks-list">
                  {subtasks.map((subtask, index) => (
                    <article
                      key={subtask.subtask_id}
                      className={`calendar-subtask-item ${
                        subtask.completed ? "completed" : ""
                      }`}
                    >
                      <div className="calendar-subtask-left">
                        <div className="calendar-subtask-index">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="calendar-subtask-copy">
                          <div className="calendar-subtask-row-top">
                            <span className="calendar-subtask-name">
                              {subtask.name}
                            </span>
                            <span
                              className={`calendar-subtask-pill ${
                                subtask.completed ? "done" : "live"
                              }`}
                            >
                              {subtask.completed ? "Done" : "In progress"}
                            </span>
                          </div>

                          <p className="calendar-subtask-note">
                            {subtask.completed
                              ? "This step is finished and checked off."
                              : "Keep going — this step is still part of today’s plan."}
                          </p>
                        </div>
                      </div>

                      <div className="calendar-subtask-buttons">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSubtaskCompletion(
                              subtask.subtask_id,
                              subtask.completed
                            )
                          }
                          className={`calendar-action-button complete ${
                            subtask.completed ? "is-complete" : ""
                          }`}
                          aria-label="Toggle subtask completion"
                        >
                          {subtask.completed ? "💖 Mark Active" : "🤍 Mark Done"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                          className="calendar-action-button delete"
                          aria-label="Delete subtask"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="calendar-state-card empty">
                  <p className="calendar-state-title">
                    No subtasks yet! Add one above ✨
                  </p>
                  <p className="calendar-state-subtitle">
                    Start turning this calendar task into smaller scheduled steps.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}