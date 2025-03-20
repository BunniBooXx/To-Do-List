import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TaskItem from "./TaskItem.jsx";
import "./TaskList.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TaskList({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [notification, setNotification] = useState(null);

  // ✅ Show Notification with Timeout
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ Fetch Tasks from Backend
  const fetchTasks = useCallback(async () => {
    if (!userId || !backendUrl) return;
    try {
      console.log(`📢 Fetching tasks from: ${backendUrl}/tasks/all/${userId}`);
      const res = await axios.get(`${backendUrl}/tasks/all/${userId}`);
      if (res.data.success) {
        setTasks(Object.values(res.data.tasks || {}));
      } else {
        showNotification("❌ Error fetching tasks", "error");
      }
    } catch (error) {
      console.error("❌ API Request Failed:", error);
      showNotification("❌ Error fetching tasks", "error");
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ Add New Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return showNotification("⚠️ Task name required!", "error");

    try {
      const res = await axios.post(`${backendUrl}/tasks/create`, { userId, name: newTaskName });
      if (res.data.success) {
        setTasks((prevTasks) => [
          ...prevTasks,
          { task_id: res.data.taskId, user_id: userId, name: newTaskName, completed: false },
        ]);
        setNewTaskName("");
        showNotification("🎀 Task added!", "success");
      }
    } catch (error) {
      console.error("❌ Error adding task:", error);
      showNotification("❌ Failed to add task", "error");
    }
  };

  // ✅ Update Task
  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await axios.put(`${backendUrl}/tasks/update`, { userId, taskId, ...updates });
      if (res.data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId ? { ...task, ...updates } : task
          )
        );
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
      showNotification("❌ Failed to update task", "error");
    }
  };

  // ✅ Delete Task (Fixed API Call)
  const handleDeleteTask = async (taskId) => {
    try {
      console.log(`📢 Sending DELETE Request: ${backendUrl}/tasks/delete/${userId}/${taskId}`);

      const res = await axios.delete(`${backendUrl}/tasks/delete/${userId}/${taskId}`);

      if (res.status === 200 && res.data.success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId));
        showNotification("✨ Task deleted!", "success");
      } else {
        console.error("❌ Delete Failed:", res.data.error);
        showNotification("❌ Failed to delete task", "error");
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
      showNotification("❌ Failed to delete task", "error");
    }
  };

  return (
    <div className="task-list-wrapper">
      {/* ✅ Show Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button className="close-btn" onClick={() => setNotification(null)}>✖</button>
        </div>
      )}

      {/* ✅ Add Task Form */}
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          placeholder="✨ Add task"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="add-task-button">Add Task 🎀</button>
      </form>

      {/* ✅ Task List */}
      <div className="tasks-wrapper">
        {tasks.map((task) => (
          <TaskItem
            key={task.task_id}
            {...task}
            user_id={userId}
            onUpdate={handleUpdateTask}  // ✅ Pass the update function directly
            onDelete={() => handleDeleteTask(task.task_id)}  // ✅ Ensure proper delete handling
          />
        ))}
        {tasks.length === 0 && (
          <p className="no-tasks">🎀 No tasks yet! Add one above. 🎀</p>
        )}
      </div>
    </div>
  );
}
