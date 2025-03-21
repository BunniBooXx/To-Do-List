// ✅ Updated Subcategory.jsx with Backend Route Matching
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ Fetch task and subtasks (with auth)
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

  // ✅ Add subtask
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
          { subtask_id: res.data.subtaskId, name: newSubtaskName, completed: false },
        ]);
        setNewSubtaskName("");
        showNotification("🎀 Subtask added successfully!", "success");
      }
    } catch (error) {
      console.error("❌ Failed to add subtask:", error);
      showNotification("❌ Failed to add subtask", "error");
    }
  };

  // ✅ Toggle subtask complete
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
          subtask.subtask_id === subtaskId ? { ...subtask, completed: updatedCompleted } : subtask
        );
        setSubtasks(updatedSubtasks);

        const allCompleted = updatedSubtasks.every((s) => s.completed);
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

  // ✅ Delete subtask
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
        setTaskCompleted(updated.every((s) => s.completed));
        showNotification("🎀 Subtask deleted!", "success");
      }
    } catch (error) {
      console.error("❌ Failed to delete subtask:", error);
      showNotification("❌ Failed to delete subtask", "error");
    }
  };

  return (
    <div className="subcategory-page">
      {notification && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}

      <h1 className="subcategory-title">♡ {taskName} ♡</h1>

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

