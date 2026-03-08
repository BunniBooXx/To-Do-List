import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./TaskItem.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TaskItem({
  task_id,
  name,
  completed,
  onUpdate,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(name);
  const [isCompleted, setIsCompleted] = useState(completed);

  const handleUpdateTask = async (updates) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const res = await axios.put(
        `${backendUrl}/tasks/update`,
        { taskId: task_id, ...updates },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (res.data.success) {
        if (updates.completed !== undefined) setIsCompleted(updates.completed);
        if (updates.name) setTaskName(updates.name);
        onUpdate(task_id, updates);
      } else {
        console.error("❌ Update Failed:", res.data.error);
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const res = await axios.delete(`${backendUrl}/tasks/delete/${task_id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (res.status === 200 && res.data.success) {
        onDelete(task_id);
      } else {
        console.error("❌ Delete Failed:", res.data.error);
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
    }
  };

  const saveEdit = () => {
    const trimmedName = taskName.trim();
    if (!trimmedName) {
      setTaskName(name);
      setIsEditing(false);
      return;
    }

    handleUpdateTask({ name: trimmedName });
    setIsEditing(false);
  };

  return (
    <div className={`task-item ${isCompleted ? "completed" : ""}`}>
      <div className="task-content">
        <button
          type="button"
          className="heart-checkbox"
          onClick={() => handleUpdateTask({ completed: !isCompleted })}
          aria-label={isCompleted ? "Mark task as incomplete" : "Mark task as completed"}
        >
          {isCompleted ? "💖" : "🤍"}
        </button>

        <div className="task-main">
          {isEditing ? (
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setTaskName(name);
                  setIsEditing(false);
                }
              }}
              className="task-edit-input"
              autoFocus
            />
          ) : (
            <span
              className="task-name"
              onClick={() => !isCompleted && setIsEditing(true)}
              title={taskName}
            >
              {taskName}
            </span>
          )}
        </div>

        <div className="task-actions">
          <Link to={`/subtasks/${task_id}`} className="subtask-toggle">
            Add Subtasks
          </Link>
          <button
            type="button"
            className="delete-task"
            onClick={handleDeleteTask}
            aria-label="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}