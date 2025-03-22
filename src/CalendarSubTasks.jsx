import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import "./CalendarSubTasks.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export default function CalendarSubtasksPage() {
  const { calendarTaskId } = useParams();
  const [userId, setUserId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [calendarTask, setCalendarTask] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSubtasks = useCallback(async () => {
    if (!calendarTaskId) return;
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const response = await axios.get(`${API_BASE_URL}/subtasks/calendar/${calendarTaskId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      setSubtasks(response.data.subtasks || []);
      setLoading(false);
    } catch (error) {
      console.error("✨ Error fetching calendar subtasks:", error);
      setLoading(false);
    }
  }, [calendarTaskId]);

  const fetchCalendarTask = useCallback(async () => {
    if (!calendarTaskId) return;
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const response = await axios.get(`${API_BASE_URL}/calendar_tasks/task/${calendarTaskId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      setCalendarTask(response.data.task);
    } catch (error) {
      console.error("Error fetching calendar task:", error);
    }
  }, [calendarTaskId]);

  useEffect(() => {
    if (userId) {
      fetchSubtasks();
      fetchCalendarTask();
    }
  }, [userId, fetchSubtasks, fetchCalendarTask]);

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      const response = await axios.post(
        `${API_BASE_URL}/subtasks/calendar/create`,
        { calendarTaskId, subtaskName: newSubtask },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.success) {
        setSubtasks((prev) => [
          ...prev,
          { subtask_id: response.data.subtaskId, name: newSubtask, completed: false },
        ]);
        setNewSubtask("");
      }
    } catch (error) {
      console.error("✨ Adding calendar subtask:", error);
    }
  };

  const toggleSubtaskCompletion = async (subtaskId, completed) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      await axios.put(
        `${API_BASE_URL}/subtasks/calendar/update/${calendarTaskId}/${subtaskId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setSubtasks((prev) =>
        prev.map((s) =>
          s.subtask_id === subtaskId ? { ...s, completed: !completed } : s
        )
      );
    } catch (error) {
      console.error("✨ Updating calendar subtask:", error);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    try {
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();

      await axios.delete(
        `${API_BASE_URL}/subtasks/calendar/delete/${calendarTaskId}/${subtaskId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setSubtasks((prev) => prev.filter((s) => s.subtask_id !== subtaskId));
    } catch (error) {
      console.error("✨ Deleting calendar subtask:", error);
    }
  };

  return (
    <div className="calendar-subtasks-container">
      <h1 className="title">❀ {calendarTask.title || calendarTask.name} ❀</h1>

      <div className="subtask-input-container">
        <input
          type="text"
          placeholder="Add a cute new subtask... 🎀"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          className="subtask-input"
        />
        <button onClick={addSubtask} className="add-button">
          Add Task 🌸
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading your subtasks... 🎀</p>
      ) : (
        <div className="subtasks-list">
          {subtasks.map((subtask) => (
            <div key={subtask.subtask_id} className="subtask-item">
              <span className={`subtask-name ${subtask.completed ? "completed" : ""}`}>
                {subtask.name}
              </span>
              <div className="subtask-buttons">
                <button
                  onClick={() => toggleSubtaskCompletion(subtask.subtask_id, subtask.completed)}
                  className="complete-button"
                >
                  {subtask.completed ? "💖" : "🤍"}
                </button>
                <button
                  onClick={() => deleteSubtask(subtask.subtask_id)}
                  className="delete-button"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {subtasks.length === 0 && <p className="no-tasks">No subtasks yet! Add one above ✨</p>}
        </div>
      )}
    </div>
  );
}
