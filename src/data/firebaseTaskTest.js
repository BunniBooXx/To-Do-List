import { createTask, getTask, getAllTasks, updateTask, deleteTask } from "./tasks.js";
import { createSubtask, getSubtasks, getSubtask, updateSubtask, deleteSubtask } from "./subtasks.js";

const testTasksAndSubtasks = async () => {
  console.log("🚀 Starting Firebase Task & Subtask Tests...");

  const testUserId = "user-1"; // Replace with a valid user ID from your Firebase DB

  try {
    // ✅ Create a Task (Name Required)
    console.log("⏳ Creating a new task...");
    const taskName = "Test Task";
    const taskId = await createTask(testUserId, taskName);
    console.log(`✅ Task created! ID: ${taskId}`);

    // ✅ Read Task Data
    console.log("⏳ Fetching created task...");
    const taskData = await getTask(testUserId, taskId);
    console.log("✅ Task Data:", taskData);

    // 🔎 Verify Required Fields in Task
    if (!taskData.name || !taskData.created_at) {
      console.error("❌ Task missing required fields!");
    } else {
      console.log("✅ Task has required fields (name, created_at).");
    }

    // ✅ Create a Subtask (Name Required)
    console.log("⏳ Creating a subtask...");
    const subtaskName = "Test Subtask";
    const subtaskId = await createSubtask(testUserId, taskId, subtaskName);
    console.log(`✅ Subtask created! ID: ${subtaskId}`);

    // ✅ Read Subtask Data
    console.log("⏳ Fetching created subtask...");
    const subtaskData = await getSubtask(testUserId, taskId, subtaskId);
    console.log("✅ Subtask Data:", subtaskData);

    // 🔎 Verify Required Fields in Subtask
    if (!subtaskData.name || !subtaskData.created_at) {
      console.error("❌ Subtask missing required fields!");
    } else {
      console.log("✅ Subtask has required fields (name, created_at).");
    }

    // ✅ Update Task
    console.log("⏳ Updating task...");
    await updateTask(testUserId, taskId, { name: "Updated Task Name", completed: true });
    const updatedTaskData = await getTask(testUserId, taskId);
    console.log("✅ Updated Task Data:", updatedTaskData);

    // ✅ Update Subtask
    console.log("⏳ Updating subtask...");
    await updateSubtask(testUserId, taskId, subtaskId, { name: "Updated Subtask", completed: true });
    const updatedSubtaskData = await getSubtask(testUserId, taskId, subtaskId);
    console.log("✅ Updated Subtask Data:", updatedSubtaskData);

    // ✅ Fetch All Tasks
    console.log("⏳ Fetching all tasks for the user...");
    const allTasks = await getAllTasks(testUserId);
    console.log("✅ All Tasks:", allTasks);

    // ✅ Fetch All Subtasks
    console.log("⏳ Fetching all subtasks for the task...");
    const allSubtasks = await getSubtasks(testUserId, taskId);
    console.log("✅ All Subtasks:", allSubtasks);

    // ✅ Delete Subtask
    console.log("⏳ Deleting subtask...");
    await deleteSubtask(testUserId, taskId, subtaskId);
    console.log(`🗑️ Subtask "${subtaskId}" deleted successfully!`);

    // ✅ Delete Task
    console.log("⏳ Deleting task...");
    await deleteTask(testUserId, taskId);
    console.log(`🗑️ Task "${taskId}" deleted successfully!`);

    console.log("🎉 Firebase Task & Subtask Tests Completed!");
  } catch (error) {
    console.error("❌ Firebase Task/Subtask Test Failed:", error);
  }
};

// Run the test
testTasksAndSubtasks();
