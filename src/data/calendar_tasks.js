import { database } from './firebaseConfig.js';
import { ref, set, get, remove, update } from 'firebase/database';

// ✅ Function to Generate Unique Calendar Task ID
const generateCalendarTaskId = async (userId) => {
  const calendarRef = ref(database, `calendar_tasks/${userId}`);
  return get(calendarRef).then(snapshot => {
    const totalCalendarTasks = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    return `calendar-${totalCalendarTasks + 1}`;
  });
};

// ✅ **Create Calendar Task (Uploads to Firebase)**
export const addTaskToCalendar = async (userId, taskId, selectedDate) => {
  if (!userId || !taskId || !selectedDate) {
    console.error("❌ Missing userId, taskId, or selectedDate!");
    return null;
  }

  const calendarId = await generateCalendarTaskId(userId);
  const calendarRef = ref(database, `calendar_tasks/${userId}/${calendarId}`);

  await set(calendarRef, {
    calendar_id: calendarId,
    user_id: userId,
    task_id: taskId,
    date: selectedDate, // Stores "YYYY-MM-DD" calendar date
    created_at: new Date().toISOString(),
  });

  console.log(`✅ Task "${taskId}" added to calendar on "${selectedDate}"!`);
  return calendarId;
};

// ✅ **Read Tasks for a Specific Calendar Date**
export const getTasksForDate = async (userId, date) => {
  const calendarRef = ref(database, `calendar_tasks/${userId}`);
  const snapshot = await get(calendarRef);

  if (snapshot.exists()) {
    const allTasks = snapshot.val();
    return Object.values(allTasks).filter(task => task.date === date);
  }
  return [];
};

// ✅ **Read All Calendar Tasks for a User**
export const getAllCalendarTasks = async (userId) => {
  const calendarRef = ref(database, `calendar_tasks/${userId}`);
  const snapshot = await get(calendarRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// ✅ **Update Calendar Task**
export const updateCalendarTask = async (userId, calendarId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    console.error("❌ No update data provided!");
    return;
  }

  const calendarRef = ref(database, `calendar_tasks/${userId}/${calendarId}`);
  await update(calendarRef, updates);
  console.log(`✅ Calendar task "${calendarId}" updated successfully!`);
};

// ✅ **Delete Calendar Task**
export const removeTaskFromCalendar = async (userId, calendarId) => {
  const calendarRef = ref(database, `calendar_tasks/${userId}/${calendarId}`);
  await remove(calendarRef);
  console.log(`🗑️ Calendar task "${calendarId}" deleted!`);
};
