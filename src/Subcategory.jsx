import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./Subcategory.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export default function Subcategory() {
  const { taskId } = useParams();
  const [userId, setUserId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [taskName, setTaskName] = useState("Loading...");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // ✅ Fetch Current User ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("❌ No user signed in.");
          return;
        }

        const idToken = await user.getIdToken();
        const res = await axios.post(`${backendUrl}/users/get-current-user`, { idToken });

        if (res.data.success) {
          setUserId(res.data.userId);
        } else {
          console.error("❌ Failed to fetch user:", res.data.error);
        }
      } catch (error) {
        console.error("❌ Authentication error:", error);
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch Task Name, Completion Status & Subtasks
  useEffect(() => {
    if (!userId || !taskId) return;

    const fetchTaskAndSubtasks = async () => {
      setLoading(true);
      try {
        const taskRes = await axios.get(`${backendUrl}/tasks/${userId}/${taskId}`);
        if (taskRes.data.success) {
          setTaskName(taskRes.data.task.name || "Unknown Task");
          setTaskCompleted(taskRes.data.task.completed || false);
        }

        const subtasksRes = await axios.get(`${backendUrl}/subtasks/${userId}/${taskId}`);
        if (subtasksRes.data.success) {
          setSubtasks(Object.values(subtasksRes.data.subtasks || {}));
        }
      } catch (error) {
        console.error("❌ Error fetching task/subtasks:", error);
      }
      setLoading(false);
    };

    fetchTaskAndSubtasks();
  }, [userId, taskId]);

  // ✅ Show Notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ Add Subtask
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;

    try {
      const res = await axios.post(`${backendUrl}/subtasks/create`, {
        userId,
        taskId,
        subtaskName: newSubtaskName,
      });

      if (res.data.success) {
        setSubtasks((prev) => [
          ...(prev || []),
          { subtask_id: res.data.subtaskId, name: newSubtaskName, completed: false },
        ]);
        setNewSubtaskName("");
        showNotification("🎀 Subtask added successfully!", "success");
      }
    } catch (error) {
      showNotification("❌ Failed to add subtask", "error");
      console.error("❌ Failed to add subtask:", error);
    }
  };

  // ✅ Update Subtask Completion
  const handleUpdateSubtask = async (subtaskId, currentCompletedState) => {
    try {
      if (!userId || !taskId || !subtaskId) {
        console.error("❌ Missing required fields:", { userId, taskId, subtaskId });
        showNotification("❌ Missing required fields!", "error");
        return;
      }

      const updatedCompleted = !currentCompletedState;

      const res = await axios.put(
        `${backendUrl}/subtasks/update/${userId}/${taskId}/${subtaskId}`,
        { completed: updatedCompleted },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        const updatedSubtasks = subtasks.map((subtask) =>
          subtask.subtask_id === subtaskId ? { ...subtask, completed: updatedCompleted } : subtask
        );
        setSubtasks(updatedSubtasks);

        const allCompleted = updatedSubtasks.every((subtask) => subtask.completed);

        if (allCompleted !== taskCompleted) {
          setTaskCompleted(allCompleted);
          await axios.put(`${backendUrl}/tasks/update/${userId}/${taskId}`, {
            completed: allCompleted,
          });
        }

        showNotification("🎀 Subtask updated!", "success");
      }
    } catch (error) {
      showNotification("❌ Failed to update subtask", "error");
      console.error("❌ Failed to update subtask:", error.response?.data || error.message);
    }
  };

  // ✅ Delete Subtask
  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await axios.delete(`${backendUrl}/subtasks/delete/${userId}/${taskId}/${subtaskId}`);

      if (res.data.success) {
        const updatedSubtasks = subtasks.filter((subtask) => subtask.subtask_id !== subtaskId);
        setSubtasks(updatedSubtasks);

        const allCompleted = updatedSubtasks.every((subtask) => subtask.completed);
        setTaskCompleted(allCompleted);

        showNotification("🎀 Subtask deleted successfully", "success");
      }
    } catch (error) {
      showNotification("❌ Failed to delete subtask", "error");
      console.error("❌ Failed to delete subtask:", error);
    }
  };

  return (
    <div className="subcategory-page">
      {/* 🎀 Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <h1 className="subcategory-title"> ♡ {taskName} ♡</h1>
      
      {/* Form with input above button */}
      <form onSubmit={handleAddSubtask}>
        <input
          type="text"
          value={newSubtaskName}
          onChange={(e) => setNewSubtaskName(e.target.value)}
          placeholder="✨ Enter subtask name..."
        />
        <button type="submit">Add Subtask 🎀</button>
      </form>

      {loading ? (
        <div className="loading-message">Loading subtasks... ⏳</div>
      ) : subtasks.length > 0 ? (
        <div className="subtask-list">
          {subtasks.map((subtask) => (
            <div key={subtask.subtask_id} className="task-item">
              <div className="task-content">
                <span className={`task-name ${subtask.completed ? "completed" : ""}`}>
                  {subtask.name}
                </span>

                <button
                  className={`heart-checkbox ${subtask.completed ? "completed" : ""}`}
                  onClick={() => handleUpdateSubtask(subtask.subtask_id, subtask.completed)}
                >
                  {subtask.completed ? "🩷" : "🤍"}
                </button>

                <button
                  className="delete-task"
                  onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-subtasks-message">No subtasks yet! 🌸</div>
      )}
    </div>
  );
}
