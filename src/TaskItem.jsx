import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./TaskItem.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TaskItem({ task_id, name, completed, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(name);
  const [isCompleted, setIsCompleted] = useState(completed);

  // ✅ Handle Task Update (with Auth)
  const handleUpdateTask = async (updates) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();

      const res = await axios.put(
        `${backendUrl}/tasks/update`,
        {
          taskId: task_id,
          ...updates,
        },
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
        console.log(`✅ Task Updated: ${task_id}`);
      } else {
        console.error("❌ Update Failed:", res.data.error);
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
    }
  };

  // ✅ Handle Task Deletion (with Auth)
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
        console.log(`✅ Task Deleted: ${task_id}`);
      } else {
        console.error("❌ Delete Failed:", res.data.error);
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
    }
  };

  return (
    <div className={`task-item ${isCompleted ? "completed" : ""}`}>
      <div className="task-content">
        <button
          className="heart-checkbox"
          onClick={() => handleUpdateTask({ completed: !isCompleted })}
          aria-label="Mark task as completed"
        >
          {isCompleted ? "💖" : "🧥"}
        </button>

        {isEditing ? (
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={() => {
              handleUpdateTask({ name: taskName });
              setIsEditing(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="task-edit-input"
            autoFocus
          />
        ) : (
          <span className="task-name" onClick={() => !isCompleted && setIsEditing(true)}>
            {taskName}
          </span>
        )}

        <div className="task-actions">
          <Link to={`/subtasks/${task_id}`} className="subtask-toggle">
            Add Subtasks
          </Link>
          <button
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
