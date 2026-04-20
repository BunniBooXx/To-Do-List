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
        showNotification("Error fetching tasks", "error");
      }
    } catch (error) {
      console.error("API request failed:", error);
      showNotification("Error fetching tasks", "error");
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const progressPercent = useMemo(
    () =>
      tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0,
    [tasks.length, completedCount]
  );

  const summaryText = useMemo(() => {
    if (tasks.length === 0) return "No tasks yet";
    return `${completedCount} of ${tasks.length} complete`;
  }, [tasks.length, completedCount]);

  /* Cap list height whenever there are tasks so the Tasks page can stay within the viewport on laptop widths (e.g. 1044px). */
  const shouldScroll = tasks.length > 0;

  const handleAddTask = async (e) => {
    e.preventDefault();

    const trimmed = newTaskName.trim();
    if (!trimmed) {
      return showNotification("Task name is required", "error");
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
        showNotification("Task added successfully", "success");
      } else {
        showNotification("Failed to add task", "error");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      showNotification("Failed to add task", "error");
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
      console.error("Error updating task:", error);
      showNotification("Failed to update task", "error");
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
        showNotification("Task deleted", "success");
      } else {
        showNotification("Failed to delete task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showNotification("Failed to delete task", "error");
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

      <section className="tasklist-summary-card" aria-label="Task overview">
        <div className="tasklist-summary-header">
          <p className="tasklist-summary-line">{summaryText}</p>
          {tasks.length > 0 && (
            <span className="tasklist-summary-pct" aria-hidden="true">
              {progressPercent}%
            </span>
          )}
        </div>
        {tasks.length > 0 && (
          <div
            className="tasklist-progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPercent}% complete`}
          >
            <div
              className="tasklist-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </section>

      <section className="tasklist-compose-card">
        <form onSubmit={handleAddTask} className="add-task-form">
          <div className="task-input-wrap">
            <input
              type="text"
              placeholder="Add a task…"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input"
            />
          </div>

          <button type="submit" className="add-task-button">
            Add task
          </button>
        </form>
      </section>

      <section className="tasks-board" aria-label="Tasks board">
        <div className="tasks-board-header">
          <h2 className="tasks-board-title">Tasks</h2>
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
            <p className="tasklist-state-title">No tasks yet</p>
            <p className="tasklist-state-subtitle">
              Add a task above to begin tracking work.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
