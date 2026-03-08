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
          setTaskName(subtaskRes.data.task.name || "Unnamed Task");
          setTaskCompleted(subtaskRes.data.task.completed || false);
          setSubtasks(Object.values(subtaskRes.data.subtasks || {}));
        }
      } catch (error) {
        console.error("❌ Error fetching task/subtasks:", error);
        showNotification("Failed to fetch task data.", "error");
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
      const idToken = await auth.currentUser.getIdToken();

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
        showNotification("🎀 Subtask added successfully!", "success");
      }
    } catch (error) {
      console.error("❌ Failed to add subtask:", error);
      showNotification("❌ Failed to add subtask", "error");
    }
  };

  const handleUpdateSubtask = async (subtaskId, currentCompletedState) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();
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

        showNotification("🎀 Subtask updated!", "success");
      }
    } catch (error) {
      console.error("❌ Failed to update subtask:", error);
      showNotification("❌ Failed to update subtask", "error");
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.delete(
        `${backendUrl}/subtasks/delete/${taskId}/${subtaskId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (res.data.success) {
        const updated = subtasks.filter((s) => s.subtask_id !== subtaskId);
        setSubtasks(updated);
        setTaskCompleted(updated.length > 0 && updated.every((s) => s.completed));
        showNotification("🎀 Subtask deleted!", "success");
      }
    } catch (error) {
      console.error("❌ Failed to delete subtask:", error);
      showNotification("❌ Failed to delete subtask", "error");
    }
  };

  const totalCount = subtasks.length;
  const completedCount = subtasks.filter((s) => s.completed).length;
  const shouldScroll = subtasks.length > 3;

  return (
    <main className="subcategory-page">
      {notification && (
        <div
          className={`subcategory-notification ${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      <section className="subcategory-stage">
        <div className="subcategory-shell">
          <div className="subcategory-topbar">
            <Link to="/tasks" className="back-to-tasks-btn">
              ← Back to Tasks
            </Link>
          </div>

          <header className="subcategory-top">
            <div className="task-summary-card">
              <p className="summary-kicker">Task details</p>
              <h1 className="subcategory-title">♡ {taskName} ♡</h1>
              <p className="summary-text">
                Break this task into smaller, manageable steps so it feels easier to
                finish.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total</span>
                  <span className="stat-number">{totalCount}</span>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Completed</span>
                  <span className="stat-number">{completedCount}</span>
                </div>

                <div className={`stat-card ${taskCompleted ? "is-complete" : ""}`}>
                  <span className="stat-label">Task</span>
                  <span className="stat-number">{taskCompleted ? "Done" : "Active"}</span>
                </div>
              </div>
            </div>
          </header>

          <section className="compose-card">
            <form className="subcategory-form" onSubmit={handleAddSubtask}>
              <label className="sr-only" htmlFor="subtaskName">
                Enter subtask name
              </label>

              <input
                id="subtaskName"
                type="text"
                className="subcategory-input"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                placeholder="✨ Enter subtask name..."
              />

              <button type="submit" className="subcategory-submit">
                Add Subtask 🎀
              </button>
            </form>
          </section>

          <section className="list-card">
            <div className="list-card-header">
              <div>
                <p className="list-kicker">Subtasks</p>
                <h2 className="list-title">Step-by-step breakdown</h2>
              </div>
              <span className="list-count">{totalCount} items</span>
            </div>

            {loading ? (
              <div className="state-card">
                <p className="state-title">Loading subtasks... ⏳</p>
                <p className="state-subtitle">Pulling in the latest task details.</p>
              </div>
            ) : subtasks.length > 0 ? (
              <div className={`subtask-scroll ${shouldScroll ? "is-scrollable" : ""}`}>
                <div className="subtask-list">
                  {subtasks.map((subtask, index) => (
                    <article
                      key={subtask.subtask_id}
                      className={`subtask-row ${subtask.completed ? "is-completed" : ""}`}
                    >
                      <div className="subtask-left">
                        <div className="subtask-index">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="subtask-copy">
                          <span
                            className={`subtask-name ${
                              subtask.completed ? "completed" : ""
                            }`}
                          >
                            {subtask.name}
                          </span>
                          <span className="subtask-status">
                            {subtask.completed ? "Completed" : "In progress"}
                          </span>
                        </div>
                      </div>

                      <div className="subtask-actions">
                        <button
                          type="button"
                          className={`subtask-action toggle-btn ${
                            subtask.completed ? "completed" : ""
                          }`}
                          onClick={() =>
                            handleUpdateSubtask(subtask.subtask_id, subtask.completed)
                          }
                        >
                          {subtask.completed ? "🩷 Done" : "🤍 Complete"}
                        </button>

                        <button
                          type="button"
                          className="subtask-action delete-btn"
                          onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="state-card empty">
                <p className="state-title">No subtasks yet! 🌸</p>
                <p className="state-subtitle">
                  Add your first subtask to turn this goal into something easier to
                  finish.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}