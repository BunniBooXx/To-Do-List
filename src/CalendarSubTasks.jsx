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
          console.error("Error getting Firebase token:", error);
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
      console.error("Error fetching calendar task:", error);
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
      console.error("Error fetching calendar subtasks:", error);
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
      console.error("Error adding subtask:", error);
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
      console.error("Error updating subtask:", error);
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
      console.error("Error deleting subtask:", error);
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

  const statusLabel =
    subtasks.length > 0 && completedCount === subtasks.length
      ? "Done"
      : "Open";

  return (
    <main className="cst-page" aria-label="Calendar subtasks">
      <div className="cst-container">
        <Link to="/planner" className="cst-back">
          ← Calendar
        </Link>

        <header className="cst-hero">
          <div className="cst-hero__intro">
            <h1 className="cst-title">
              <span className="cst-title__shimmer">
                {calendarTask.name || "Task"}
              </span>
            </h1>
            {subtasks.length > 0 && (
              <p className="cst-lede">
                {subtasks.length} step{subtasks.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <div className="cst-metrics" aria-label="Progress">
            <div className="cst-metrics__progress">
              <div
                className="cst-metrics__track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  className="cst-metrics__fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="cst-metrics__pct">{progressPercent}%</span>
            </div>
            <dl className="cst-metrics__stats">
              <div className="cst-metric">
                <dt className="cst-metric__label">Total</dt>
                <dd className="cst-metric__val">{subtasks.length}</dd>
              </div>
              <div className="cst-metric">
                <dt className="cst-metric__label">Done</dt>
                <dd className="cst-metric__val">{completedCount}</dd>
              </div>
              <div className="cst-metric">
                <dt className="cst-metric__label">Status</dt>
                <dd className="cst-metric__val cst-metric__val--sm">
                  {statusLabel}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section
          className="cst-panel cst-panel--add"
          aria-labelledby="cst-add-title"
        >
          <div className="cst-panel__row">
            <h2 id="cst-add-title" className="cst-panel__title">
              Add step
            </h2>
            <button
              type="button"
              className="cst-panel__toggle"
              onClick={() => setShowSubtaskForm((prev) => !prev)}
              aria-expanded={showSubtaskForm}
              aria-controls="cst-add-form"
            >
              {showSubtaskForm ? "Close" : "Add"}
            </button>
          </div>

          {showSubtaskForm && (
            <form
              id="cst-add-form"
              className="cst-add-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSubtask();
              }}
            >
              <input
                type="text"
                placeholder="Step name"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="cst-input"
                autoComplete="off"
              />
              <button type="submit" className="cst-btn cst-btn--primary">
                Add
              </button>
            </form>
          )}
        </section>

        <section
          className="cst-panel cst-panel--list"
          aria-labelledby="cst-list-title"
        >
          <div className="cst-panel__row">
            <h2 id="cst-list-title" className="cst-panel__title">
              Subtasks
            </h2>
            {subtasks.length > 0 && (
              <span className="cst-panel__meta">{subtasks.length}</span>
            )}
          </div>

          {loading ? (
            <p className="cst-state cst-state--muted">Loading…</p>
          ) : subtasks.length > 0 ? (
            <ul className="cst-rows">
              {subtasks.map((subtask) => (
                <li
                  key={subtask.subtask_id}
                  className={`cst-row ${subtask.completed ? "cst-row--done" : ""}`}
                >
                  <div className="cst-row__check">
                    <input
                      type="checkbox"
                      id={`subtask-${subtask.subtask_id}`}
                      className="cst-checkbox"
                      checked={subtask.completed}
                      onChange={() =>
                        handleToggleSubtaskCompletion(
                          subtask.subtask_id,
                          subtask.completed
                        )
                      }
                      aria-label={
                        subtask.completed
                          ? `Mark "${subtask.name}" not done`
                          : `Mark "${subtask.name}" done`
                      }
                    />
                  </div>
                  <label
                    htmlFor={`subtask-${subtask.subtask_id}`}
                    className="cst-row__name"
                  >
                    {subtask.name}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                    className="cst-del"
                    aria-label={`Delete ${subtask.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cst-empty">
              <p className="cst-empty__line">No steps yet</p>
              <p className="cst-empty__hint">Add a step above.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
