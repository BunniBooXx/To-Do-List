import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // ✅ Firebase Auth
import { useParams } from "react-router-dom"; // ✅ Get calendarTaskId from URL
import "./CalendarSubTasks.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
console.log("API_BASE_URL:", API_BASE_URL);

export default function CalendarSubtasksPage() {
  const { calendarTaskId } = useParams(); // ✅ Get calendarTaskId from URL
  const [userId, setUserId] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  // Add this state variable declaration at the top of your component with the other state variables
  const [calendarTask, setCalendarTask] = useState({});
  const [newSubtask, setNewSubtask] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ **Fetch the Logged-in User ID from Firebase**
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.post(`${API_BASE_URL}/users/get-current-user`, { idToken: token });
          console.log("Fetched User:", response.data);
          setUserId(response.data.userId);
        } catch (error) {
          console.error("Error fetching user ID:", error.response?.data || error.message);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ **Fetch Calendar Subtasks**
  const fetchSubtasks = useCallback(async () => {
    if (!userId || !calendarTaskId) return;
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subtasks/calendar/${userId}/${calendarTaskId}`
      );
      setSubtasks(response.data.subtasks || []);
      setLoading(false);
    } catch (error) {
      console.error("✨ Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setLoading(false);
    }
  }, [userId, calendarTaskId]);

  // fetch Calendar Task Name 
const fetchCalendarTask = useCallback(async () => {
  if (!userId || !calendarTaskId) return;
  
  try {
    // Update this URL to match your backend endpoint structure
    const response = await axios.get(
      `${API_BASE_URL}/calendar_tasks/${userId}/calendar-task/${calendarTaskId}`
    );
    console.log("Calendar task response:", response.data);
    setCalendarTask(response.data.task);
  } catch (error) {
    console.error("Error fetching calendar task:", error.response?.data || error.message);
  }
}, [userId, calendarTaskId]);

  
  
  
  
  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    
    console.log("Adding subtask:", {userId, calendarTaskId, subtaskName: newSubtask});
    
    try {
      const response = await axios.post(`${API_BASE_URL}/subtasks/calendar/create`, {
        userId,
        calendarTaskId,
        subtaskName: newSubtask
      });
      
      console.log("Add response:", response.data);
      
      if (response.data.success) {
        setSubtasks(prev => [...prev, { 
          subtask_id: response.data.subtaskId, 
          name: newSubtask, 
          completed: false 
        }]);
        setNewSubtask("");
      }
    } catch (error) {
      console.log("API URL:", API_BASE_URL);
      console.error("✨ Adding subtask:", error.response || error);
    }
  };
  
  useEffect(() => {
    fetchSubtasks();
    fetchCalendarTask();
  }, [fetchSubtasks, fetchCalendarTask]);
  
  
  
  
  const toggleSubtaskCompletion = async (subtaskId, completed) => {
    try {
      await axios.put(`${API_BASE_URL}/subtasks/calendar/update/${userId}/${calendarTaskId}/${subtaskId}`, {
        completed: !completed
      });
      
      setSubtasks(prev =>
        prev.map(subtask =>
          subtask.subtask_id === subtaskId 
            ? { ...subtask, completed: !completed } 
            : subtask
        )
      );
    } catch (error) {
      console.error("✨ Updating subtask:", error);
    }
  };
  
  const deleteSubtask = async (subtaskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/subtasks/calendar/delete/${userId}/${calendarTaskId}/${subtaskId}`);
      setSubtasks(prev => prev.filter(subtask => subtask.subtask_id !== subtaskId));
    } catch (error) {
      console.error("✨ Deleting subtask:", error);
    }
  };
  

  return (
    <div className="calendar-subtasks-container">
      <h1 className="title">❀ {calendarTask.title || calendarTask.name} ❀</h1>
      {/* ✅ Input Field to Add Subtasks */}
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

      {/* ✅ Loading Indicator */}
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
                <button onClick={() => toggleSubtaskCompletion(subtask.subtask_id, subtask.completed)} className="complete-button">
                  {subtask.completed ? "💖" : "🤍"}
                </button>
                <button onClick={() => deleteSubtask(subtask.subtask_id)} className="delete-button">
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
