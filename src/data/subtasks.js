import { database } from './firebaseConfig.js';
import { ref, set, get, remove, update } from 'firebase/database';

// ✅ Function to Generate Unique Subtask ID
const generateSubtaskId = async (userId, taskId) => {
  const subtasksRef = ref(database, `tasks/${userId}/${taskId}/subtasks`);
  const snapshot = await get(subtasksRef);
  const totalSubtasks = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  return `subtask-${totalSubtasks + 1}`;
};

// ✅ **Create Subtask (Uploads to Firebase)**
export const createSubtask = async (userId, taskId, subtaskName) => {
  if (!userId || !taskId || !subtaskName) {
    console.error("❌ Missing userId, taskId, or subtaskName!");
    return null;
  }

  const subtaskId = await generateSubtaskId(userId, taskId);
  const subtaskRef = ref(database, `tasks/${userId}/${taskId}/subtasks/${subtaskId}`);

  await set(subtaskRef, {
    subtask_id: subtaskId,
    user_id: userId,
    task_id: taskId,
    name: subtaskName, // ✅ Stores user input correctly
    completed: false,
    created_at: new Date().toISOString(),
  });

  console.log(`✅ Subtask "${subtaskName}" added to task "${taskId}"!`);
  return subtaskId;
};

// ✅ **Read All Subtasks for a Task**
export const getSubtasks = async (userId, taskId) => {
  const subtasksRef = ref(database, `tasks/${userId}/${taskId}/subtasks`);
  const snapshot = await get(subtasksRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// ✅ **Read Single Subtask**
export const getSubtask = async (userId, taskId, subtaskId) => {
  const subtaskRef = ref(database, `tasks/${userId}/${taskId}/subtasks/${subtaskId}`);
  const snapshot = await get(subtaskRef);
  return snapshot.exists() ? snapshot.val() : null;
};

// ✅ **Update Subtask**
export const updateSubtask = async (userId, taskId, subtaskId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    console.error("❌ No update data provided!");
    return;
  }

  const subtaskRef = ref(database, `tasks/${userId}/${taskId}/subtasks/${subtaskId}`);
  await update(subtaskRef, updates);
  console.log(`✅ Subtask "${subtaskId}" updated successfully!`);
};

// ✅ **Delete Subtask**
export const deleteSubtask = async (userId, taskId, subtaskId) => {
  const subtaskRef = ref(database, `tasks/${userId}/${taskId}/subtasks/${subtaskId}`);
  await remove(subtaskRef);
  console.log(`🗑️ Subtask "${subtaskId}" deleted!`);
};
