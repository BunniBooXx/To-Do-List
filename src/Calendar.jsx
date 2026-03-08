import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import axios from "axios";
import { initFirebase } from "./firebase";
import "./Calendar.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function logAxiosError(label, error) {
  const info = {
    label,
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
    url: error?.config?.url,
    method: error?.config?.method,
    payload: error?.config?.data,
    hasAuthHeader: !!error?.config?.headers?.Authorization,
    contentType:
      error?.config?.headers?.["Content-Type"] ||
      error?.config?.headers?.["content-type"],
  };

  console.groupCollapsed(`❌ ${label}`);
  console.table(info);
  console.log("raw error:", error);
  console.groupEnd();
}

function logRequest(label, { method, url, payload, hasToken }) {
  console.groupCollapsed(`➡️ ${label}`);
  console.log({ method, url, payload, hasToken });
  console.groupEnd();
}

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

  useEffect(() => {
    document.body.classList.add("route-calendar");
    return () => document.body.classList.remove("route-calendar");
  }, []);

  useEffect(() => {
    if (!BACKEND_URL) {
      console.error(
        "⛔ REACT_APP_BACKEND_URL is missing (BACKEND_URL is undefined). Check your .env and restart/redeploy."
      );
    }
  }, []);

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
          try {
            const token = await user.getIdToken();
            setIdToken(token);
            setUserId(user.uid);
          } catch (e) {
            console.error("❌ Failed to get ID token:", e);
            setIdToken(null);
            setUserId(null);
          }
        } else {
          setIdToken(null);
          setUserId(null);
        }
      });
    })();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => config);

    const resId = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        logAxiosError("axios response error", err);
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, []);

  const fetchCalendarTasks = useCallback(async () => {
    if (!idToken || !BACKEND_URL) return;

    const url = `${BACKEND_URL}/calendar_tasks/all`;
    logRequest("fetchCalendarTasks", {
      method: "GET",
      url,
      payload: null,
      hasToken: true,
    });

    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      setTasks(res.data.tasks || {});
    } catch (e) {
      logAxiosError("Error fetching calendar tasks", e);
    }
  }, [idToken]);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const fetchTasksForDate = useCallback(
    async (date) => {
      if (!idToken || !BACKEND_URL) return;

      const url = `${BACKEND_URL}/calendar_tasks/date/${date}`;
      logRequest("fetchTasksForDate", {
        method: "GET",
        url,
        payload: null,
        hasToken: true,
      });

      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (res.data?.success) {
          setTasks((prev) => ({
            ...prev,
            [date]: res.data.tasks || [],
          }));
        }
      } catch (e) {
        logAxiosError("Error fetching tasks for date", e);
      }
    },
    [idToken]
  );

  const handleDateClick = async (dateKey) => {
    setSelectedDate(dateKey);
    setShowTaskModal(true);
    setShowTaskForm(false);
    await fetchTasksForDate(dateKey);
  };

  const handleAddTask = async () => {
    if (!idToken) return setNotification("🚫 Please log in to add a task.");
    if (!newTaskName.trim()) return setNotification("⚠️ Task name cannot be empty.");
    if (!selectedDate) return setNotification("⚠️ No date selected.");
    if (!BACKEND_URL) return setNotification("⛔ BACKEND_URL missing.");

    const trimmedName = newTaskName.trim();

    try {
      const createUrl = `${BACKEND_URL}/tasks/create`;
      const createPayload = { name: trimmedName };

      const createRes = await axios.post(createUrl, createPayload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const taskId = createRes?.data?.taskId;

      if (!taskId) {
        return setNotification("❌ Failed to create task.");
      }

      const calendarUrl = `${BACKEND_URL}/calendar_tasks/add`;
      const calendarPayload = {
        taskId,
        date: selectedDate,
        name: trimmedName,
      };

      const calendarRes = await axios.post(calendarUrl, calendarPayload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!calendarRes.data?.success) {
        return setNotification("❌ Failed to attach task to calendar.");
      }

      setNewTaskName("");
      await fetchTasksForDate(selectedDate);
      setNotification("✅ Task added successfully!");
      window.setTimeout(() => setNotification(""), 2200);
    } catch (e) {
      logAxiosError("handleAddTask failed", e);
      setNotification("❌ Failed to add task.");
    }
  };

  const handleDeleteCalendarTask = async (calendarId) => {
    try {
      if (!calendarId || !idToken || !BACKEND_URL) return;

      const url = `${BACKEND_URL}/calendar_tasks/remove/${calendarId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      await fetchTasksForDate(selectedDate);
      setNotification("🗑️ Task deleted.");
      window.setTimeout(() => setNotification(""), 1800);
    } catch (e) {
      logAxiosError("Error deleting task", e);
      setNotification("❌ Failed to delete task.");
    }
  };

  const handleCompleteCalendarTask = async (calendarId, completed) => {
    try {
      if (!idToken || !BACKEND_URL) return;

      const url = `${BACKEND_URL}/calendar_tasks/update/${calendarId}`;
      const payload = { completed: !completed };

      await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      await fetchTasksForDate(selectedDate);
      setNotification(!completed ? "💖 Task completed!" : "🤍 Task marked active.");
      window.setTimeout(() => setNotification(""), 1800);
    } catch (e) {
      logAxiosError("Error updating task", e);
      setNotification("❌ Failed to update task.");
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

  const goPrevMonth = () => setMonthView(new Date(year, month - 1, 1));
  const goNextMonth = () => setMonthView(new Date(year, month + 1, 1));

  return (
    <main className="calendar-page" aria-label="Calendar page">
      {!showTaskModal && notification && (
        <div className="cal-notif-wrap cal-notif-global" aria-live="polite" aria-atomic="true">
          <div className="cal-notif" role="status">
            <span className="cal-notif-text">{notification}</span>
            <button
              type="button"
              className="cal-notif-x"
              onClick={() => setNotification("")}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <section className="cal-stage">
        <div className="cal-shell">
          <div className="cal-card">
            <header className="cal-header">
              <button
                type="button"
                className="month-arrow"
                onClick={goPrevMonth}
                aria-label="Previous month"
              >
                ❮
              </button>

              <div className="month-copy">
                <p className="month-kicker">Monthly planner</p>
                <h1 className="month-label">
                  {monthView.toLocaleString("default", { month: "long" })} {year}
                </h1>
              </div>

              <button
                type="button"
                className="month-arrow"
                onClick={goNextMonth}
                aria-label="Next month"
              >
                ❯
              </button>
            </header>

            <div className="weekday-row" aria-hidden="true">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day} className="weekday-pill">
                  {day}
                </span>
              ))}
            </div>

            <div className="calendar-grid" role="grid" aria-label="Month grid">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="empty-day" aria-hidden="true" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                  i + 1
                ).padStart(2, "0")}`;

                const hasTasks = (tasks[dateKey]?.length || 0) > 0;
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={`calendar-day ${hasTasks ? "has-tasks" : ""} ${
                      isSelected ? "is-selected" : ""
                    }`}
                    onClick={() => handleDateClick(dateKey)}
                    aria-label={`Open tasks for ${formatDate(dateKey)}`}
                  >
                    <span className="day-num">{i + 1}</span>
                    {hasTasks && <span className="task-indicator">🎀</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showTaskModal && (
        <div
          className="task-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
          onClick={() => setShowTaskModal(false)}
        >
          <div className="task-modal-stack" onClick={(e) => e.stopPropagation()}>
            {notification && (
              <div className="cal-notif-wrap cal-notif-inline" aria-live="polite" aria-atomic="true">
                <div className="cal-notif" role="status">
                  <span className="cal-notif-text">{notification}</span>
                  <button
                    type="button"
                    className="cal-notif-x"
                    onClick={() => setNotification("")}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="modal-content">
              <button
                type="button"
                className="close-modal-button"
                onClick={() => setShowTaskModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="modal-header">
                <p className="modal-kicker">Selected date</p>

                <div className="modal-title-wrap">
                  <h2 id="task-modal-title">{formatDate(selectedDate)}</h2>
                  <p className="modal-subtitle">
                    Add, complete, or organize tasks for this day.
                  </p>
                </div>
              </div>

              <div className="modal-toolbar">
                <button
                  type="button"
                  className="toggle-form-button"
                  onClick={() => setShowTaskForm((v) => !v)}
                >
                  {showTaskForm ? "Hide Task Form" : "Add New Task"}
                </button>
              </div>

              {showTaskForm && (
                <form
                  className="task-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask();
                  }}
                >
                  <label className="sr-only" htmlFor="taskName">
                    Task name
                  </label>

                  <div className="task-form-card">
                    <input
                      id="taskName"
                      className="task-input"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Enter task name..."
                    />

                    <button type="submit" className="submit-task-button">
                      Add Task 🎀
                    </button>
                  </div>
                </form>
              )}

              <div className="tasks-list">
                {tasks[selectedDate]?.length > 0 ? (
                  tasks[selectedDate].map((task) => (
                    <article key={task.calendar_id} className="task-item">
                      <div className="task-main">
                        <span
                          className={task.completed ? "task-name completed" : "task-name"}
                        >
                          {task.name}
                        </span>

                        <span className="task-status">
                          {task.completed ? "Completed" : "Active"}
                        </span>
                      </div>

                      <div className="task-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteCalendarTask(task.calendar_id, task.completed)
                          }
                          className="task-action complete-btn"
                          aria-label="Toggle complete"
                        >
                          {task.completed ? "💖 Done" : "🤍 Complete"}
                        </button>

                        <Link
                          to={`/calendar-subtasks/${userId}/${task.calendar_id}`}
                          className="task-action subtask-button"
                        >
                          ✨ Add Subtasks
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteCalendarTask(task.calendar_id)}
                          className="task-action delete-btn"
                          aria-label="Delete task"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <p className="no-tasks">No tasks yet for this day 🎀</p>
                    <p className="empty-state-sub">
                      Start by adding your first task and build your schedule from here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}