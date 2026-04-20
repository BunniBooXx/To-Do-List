import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./Subcategory.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function Subcategory() {
  const { taskId } = useParams();
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [taskName, setTaskName] = useState("Loading...");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 2600);
  };

  useEffect(() => {
    document.body.classList.add("route-subcategory");
    return () => document.body.classList.remove("route-subcategory");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const idToken = await currentUser.getIdToken();

        const subtaskRes = await axios.get(`${backendUrl}/subtasks/${taskId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (subtaskRes.data.success) {
          setTaskName(subtaskRes.data.task.name || "Unnamed task");
          setTaskCompleted(subtaskRes.data.task.completed || false);
          setSubtasks(Object.values(subtaskRes.data.subtasks || {}));
        }
      } catch (error) {
        console.error("Error fetching task/subtasks:", error);
        showNotification("Could not load task data. Try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      const res = await axios.post(
        `${backendUrl}/subtasks/create`,
        { taskId, subtaskName: newSubtaskName },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (res.data.success) {
        setSubtasks((prev) => [
          ...prev,
          {
            subtask_id: res.data.subtaskId,
            name: newSubtaskName,
            completed: false,
          },
        ]);
        setNewSubtaskName("");
        showNotification("Subtask added.", "success");
      }
    } catch (error) {
      console.error("Failed to add subtask:", error);
      showNotification("Could not add subtask.", "error");
    }
  };

  const handleUpdateSubtask = async (subtaskId, currentCompletedState) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const updatedCompleted = !currentCompletedState;

      const res = await axios.put(
        `${backendUrl}/subtasks/update/${taskId}/${subtaskId}`,
        { completed: updatedCompleted },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (res.data.success) {
        const updatedSubtasks = subtasks.map((subtask) =>
          subtask.subtask_id === subtaskId
            ? { ...subtask, completed: updatedCompleted }
            : subtask
        );

        setSubtasks(updatedSubtasks);

        const allCompleted =
          updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

        if (allCompleted !== taskCompleted) {
          await axios.put(
            `${backendUrl}/tasks/update`,
            { taskId, completed: allCompleted },
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
          setTaskCompleted(allCompleted);
        }

        showNotification("Subtask updated.", "success");
      }
    } catch (error) {
      console.error("Failed to update subtask:", error);
      showNotification("Could not update subtask.", "error");
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      const res = await axios.delete(
        `${backendUrl}/subtasks/delete/${taskId}/${subtaskId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (res.data.success) {
        const updated = subtasks.filter((s) => s.subtask_id !== subtaskId);
        setSubtasks(updated);
        setTaskCompleted(updated.length > 0 && updated.every((s) => s.completed));
        showNotification("Subtask removed.", "success");
      }
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      showNotification("Could not delete subtask.", "error");
    }
  };

  const totalCount = subtasks.length;
  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <main className="subcategory-page" aria-label="Task detail">
      <section className="subcategory-shell">
        {notification && (
          <div
            className={`subcategory-notification ${notification.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="subcategory-notification__accent" aria-hidden="true" />
            <span className="subcategory-notification__icon" aria-hidden="true">
              {notification.type === "success" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="subcategory-notification__text">{notification.message}</span>
          </div>
        )}

        <div className="subcategory-workspace">
          <div className="subcategory-topbar">
            <Link to="/tasks" className="subcategory-back">
              <span className="subcategory-back__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Back to tasks
            </Link>
          </div>

          <header className="subcategory-header">
            <div className="subcategory-header__copy">
              <p className="subcategory-header__eyebrow">Task workspace</p>
              <h1 className="subcategory-title">{taskName}</h1>
              <p className="subcategory-description">
                Organize this task into clear, trackable subtasks. Completion updates progress
                automatically.
              </p>

              {!loading && (
                <div className="subcategory-meta" aria-label="Subtask summary">
                  <span className="subcategory-meta__text">
                    {totalCount} subtask{totalCount !== 1 ? "s" : ""}
                    <span className="subcategory-meta__sep" aria-hidden="true">
                      {" "}
                      ·{" "}
                    </span>
                    {completedCount} done
                  </span>
                  <span
                    className={`subcategory-status ${taskCompleted ? "subcategory-status--done" : ""}`}
                  >
                    {taskCompleted ? "Complete" : "In progress"}
                  </span>
                </div>
              )}
            </div>
          </header>

          <section className="subcategory-todo-card" aria-label="Subtasks">
            <div className="subcategory-card-head">
              <h2 className="subcategory-card-head__title">Subtasks</h2>
              {!loading && totalCount > 0 && (
                <span className="subcategory-card-head__badge" aria-hidden="true">
                  {completedCount}/{totalCount}
                </span>
              )}
            </div>

            <form className="subcategory-form" onSubmit={handleAddSubtask}>
              <label className="sr-only" htmlFor="subtaskName">
                Subtask name
              </label>
              <div className="subcategory-form__field">
                <input
                  id="subtaskName"
                  type="text"
                  className="subcategory-input"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="Add a subtask…"
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="subcategory-submit">
                Add
              </button>
            </form>

            <div className="subcategory-todo-card__body">
              {loading ? (
                <div
                  className="subcategory-state subcategory-state--loading"
                  aria-busy="true"
                  aria-live="polite"
                >
                  <div className="subcategory-state__skeleton" aria-hidden="true">
                    <span className="subcategory-state__skeleton-line subcategory-state__skeleton-line--lg" />
                    <span className="subcategory-state__skeleton-line" />
                    <span className="subcategory-state__skeleton-line subcategory-state__skeleton-line--sm" />
                  </div>
                  <p className="subcategory-state__title">Loading subtasks</p>
                  <p className="subcategory-state__text">Fetching the latest details.</p>
                </div>
              ) : subtasks.length > 0 ? (
                <div className="subtask-scroll">
                  <ul className="subtask-list" aria-label="Subtask list">
                    {subtasks.map((subtask) => (
                      <li key={subtask.subtask_id}>
                        <article
                          className={`subtask-row ${subtask.completed ? "is-completed" : ""}`}
                        >
                          <button
                            type="button"
                            className={`subtask-check ${subtask.completed ? "is-on" : ""}`}
                            onClick={() =>
                              handleUpdateSubtask(subtask.subtask_id, subtask.completed)
                            }
                            aria-label={
                              subtask.completed
                                ? "Mark subtask incomplete"
                                : "Mark subtask complete"
                            }
                          >
                            {subtask.completed ? (
                              <svg
                                className="subtask-check__icon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M20 6L9 17l-5-5"
                                  stroke="currentColor"
                                  strokeWidth="2.25"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <span className="subtask-check__empty" aria-hidden="true" />
                            )}
                          </button>

                          <span
                            className={`subtask-name ${subtask.completed ? "is-done" : ""}`}
                          >
                            {subtask.name}
                          </span>

                          <button
                            type="button"
                            className="subtask-delete"
                            onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                            aria-label="Delete subtask"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="subcategory-state subcategory-state--empty">
                  <p className="subcategory-state__title">No subtasks yet</p>
                  <p className="subcategory-state__text">
                    Add items above to split this task into trackable steps.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
