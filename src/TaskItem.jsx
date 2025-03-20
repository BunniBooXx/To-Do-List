import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./TaskItem.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function TaskItem({ user_id, task_id, name, completed, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(name);
  const [isCompleted, setIsCompleted] = useState(completed);

  // ✅ Handle Task Update
  const handleUpdateTask = async (updates) => {
    try {
      console.log(`📢 Updating Task: ${task_id} for user ${user_id}`, updates);

      const res = await axios.put(`${backendUrl}/tasks/update`, {
        userId: user_id,
        taskId: task_id,
        ...updates,
      });

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

  // ✅ Handle Task Deletion (Fixed to Match Backend)
  const handleDeleteTask = async () => {
    try {
      console.log(`📢 Sending DELETE Request: ${backendUrl}/tasks/delete/${user_id}/${task_id}`);

      const res = await axios.delete(`${backendUrl}/tasks/delete/${user_id}/${task_id}`);

      console.log("🛠️ DELETE Response:", res);

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
        {/* ✅ Toggle Task Completion */}
        <button 
          className="heart-checkbox" 
          onClick={() => handleUpdateTask({ completed: !isCompleted })}
          aria-label="Mark task as completed"
        >
          {isCompleted ? "💖" : "🤍"}
        </button>

        {/* ✅ Edit Task Name */}
        {isEditing ? (
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={() => { handleUpdateTask({ name: taskName }); setIsEditing(false); }}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="task-edit-input"
            autoFocus
          />
        ) : (
          <span className="task-name" onClick={() => !isCompleted && setIsEditing(true)}>
            {taskName}
          </span>
        )}

        {/* ✅ Task Actions */}
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
