import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import TaskItem from "./TaskItem.jsx";
import { getAuth } from "firebase/auth";
import "./TaskList.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 3200);
  };

  const fetchTasks = useCallback(async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const idToken = await currentUser.getIdToken();
      const res = await axios.get(`${backendUrl}/tasks/all`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (res.data.success) {
        setTasks(Object.values(res.data.tasks || {}));
      } else {
        showNotification("❌ Error fetching tasks", "error");
      }
    } catch (error) {
      console.error("❌ API Request Failed:", error);
      showNotification("❌ Error fetching tasks", "error");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const statusLabel =
    tasks.length > 0 && completedCount === tasks.length ? "Done" : "Active";

  const shouldScroll = tasks.length > 3;

  const handleAddTask = async (e) => {
    e.preventDefault();

    const trimmed = newTaskName.trim();
    if (!trimmed) {
      return showNotification("⚠️ Task name required!", "error");
    }

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.post(
        `${backendUrl}/tasks/create`,
        { name: trimmed },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (res.data.success) {
        setTasks((prev) => [
          ...prev,
          {
            task_id: res.data.taskId,
            name: trimmed,
            completed: false,
          },
        ]);
        setNewTaskName("");
        showNotification("🎀 Task added!", "success");
      } else {
        showNotification("❌ Failed to add task", "error");
      }
    } catch (error) {
      console.error("❌ Error adding task:", error);
      showNotification("❌ Failed to add task", "error");
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.put(
        `${backendUrl}/tasks/update`,
        { taskId, ...updates },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (res.data.success) {
        setTasks((prev) =>
          prev.map((task) =>
            task.task_id === taskId ? { ...task, ...updates } : task
          )
        );
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
      showNotification("❌ Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.delete(`${backendUrl}/tasks/delete/${taskId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (res.status === 200 && res.data.success) {
        setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
        showNotification("✨ Task deleted!", "success");
      } else {
        showNotification("❌ Failed to delete task", "error");
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
      showNotification("❌ Failed to delete task", "error");
    }
  };

  return (
    <section className="task-list-wrapper" aria-label="Task list">
      {notification && (
        <div
          className={`tasklist-notification ${notification.type}`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      <section className="tasklist-summary-card">
        <div className="tasklist-summary-header">
          <div>
            <p className="tasklist-summary-kicker">Task overview</p>
            <h2 className="tasklist-summary-title">Daily checklist status</h2>
          </div>

          <span className="tasklist-progress-pill">{progressPercent}% complete</span>
        </div>

        <div className="tasklist-stats-grid">
          <div className="task-stat-card">
            <span className="task-stat-label">Total</span>
            <span className="task-stat-value">{tasks.length}</span>
          </div>

          <div className="task-stat-card">
            <span className="task-stat-label">Completed</span>
            <span className="task-stat-value">{completedCount}</span>
          </div>

          <div className={`task-stat-card ${statusLabel === "Done" ? "is-complete" : ""}`}>
            <span className="task-stat-label">Status</span>
            <span className="task-stat-value">{statusLabel}</span>
          </div>
        </div>
      </section>

      <section className="tasklist-compose-card">
        <form onSubmit={handleAddTask} className="add-task-form">
          <div className="task-input-wrap">
            <span className="task-input-icon" aria-hidden="true">
              ✨
            </span>

            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input"
            />
          </div>

          <button type="submit" className="add-task-button">
            Add Task
          </button>
        </form>
      </section>

      <section className="tasks-board" aria-label="Tasks board">
        <div className="tasks-board-header">
          <div>
            <p className="tasks-board-kicker">Your list</p>
            <h2 className="tasks-board-title">Today’s tasks</h2>
          </div>

          <span className="tasks-board-count">{tasks.length} items</span>
        </div>

        {tasks.length > 0 ? (
          <div className={`tasks-scroll-shell ${shouldScroll ? "is-scrollable" : ""}`}>
            <div className="tasks-wrapper">
              {tasks.map((task) => (
                <TaskItem
                  key={task.task_id}
                  {...task}
                  onUpdate={handleUpdateTask}
                  onDelete={() => handleDeleteTask(task.task_id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="tasklist-state-card empty">
            <p className="tasklist-state-title">No tasks yet! 🌸</p>
            <p className="tasklist-state-subtitle">
              Add your first task above to start organizing your day.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}