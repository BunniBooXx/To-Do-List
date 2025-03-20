import { database } from './firebaseConfig.js';
import { ref, set, get, remove, update } from 'firebase/database';

// ✅ Function to Generate Unique Task ID
const generateTaskId = async (userId) => {
  const tasksRef = ref(database, `tasks/${userId}`);
  const snapshot = await get(tasksRef);
  const totalTasks = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  return `task-${totalTasks + 1}`;
};

// ✅ **Create Task (Uploads to Firebase)**
export const createTask = async (userId, name) => {
  if (!userId || !name) {
    console.error("❌ Missing userId or task name!");
    return null;
  }

  const taskId = await generateTaskId(userId);
  const taskRef = ref(database, `tasks/${userId}/${taskId}`);

  await set(taskRef, {
    task_id: taskId,
    user_id: userId,
    name,
    completed: false,
    created_at: new Date().toISOString(),
    subtasks: {}, // Initialize as empty object for subtasks instead of null
  });

  console.log(`✅ Task "${name}" added successfully!`);
  return taskId;
};

// ✅ **Read Single Task**
export const getTask = async (userId, taskId) => {
  const taskRef = ref(database, `tasks/${userId}/${taskId}`);
  const snapshot = await get(taskRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// ✅ **Read All Tasks for a User**
export const getAllTasks = async (userId) => {
  const tasksRef = ref(database, `tasks/${userId}`);
  const snapshot = await get(tasksRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// ✅ **Update Task**
export const updateTask = async (userId, taskId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    console.error("❌ No update data provided!");
    return;
  }

  const taskRef = ref(database, `tasks/${userId}/${taskId}`);
  await update(taskRef, updates);
  console.log(`✅ Task "${taskId}" updated successfully!`);
};

// ✅ **Delete Task**
export const deleteTask = async (userId, taskId) => {
  const taskRef = ref(database, `tasks/${userId}/${taskId}`);
  await remove(taskRef);
  console.log(`🗑️ Task "${taskId}" deleted!`);
};
