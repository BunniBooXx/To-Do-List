import React, { useState, useEffect, useCallback } from "react";
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
    setTimeout(() => setNotification(null), 4000);
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

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTaskName.trim()) {
      return showNotification("⚠️ Task name required!", "error");
    }

    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.post(
        `${backendUrl}/tasks/create`,
        { name: newTaskName },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (res.data.success) {
        setTasks((prev) => [
          ...prev,
          {
            task_id: res.data.taskId,
            name: newTaskName,
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
    <div className="task-list-wrapper">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-text">{notification.message}</span>
          <button
            className="close-btn"
            onClick={() => setNotification(null)}
            type="button"
            aria-label="Close notification"
          >
            ✖
          </button>
        </div>
      )}

      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          placeholder="✨ Add task"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="add-task-button">
          Add Task 🎀
        </button>
      </form>

      <div className="tasks-scroll-shell">
        <div className="tasks-wrapper">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.task_id}
                {...task}
                onUpdate={handleUpdateTask}
                onDelete={() => handleDeleteTask(task.task_id)}
              />
            ))
          ) : (
            <p className="no-tasks">🎀 No tasks yet! Add one above. 🎀</p>
          )}
        </div>
      </div>
    </div>
  );
}