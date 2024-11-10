import { useState, useEffect } from "react";
import TaskItem from "./TaskItem";
import "./TaskList.css";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  // Load tasks from local storage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (name) => {
    setTasks([...tasks, { name, done: false, subtasks: [] }]);
  };

  const updateTask = (index, updatedTask) => {
    if (updatedTask === null) {
      // Remove the task when updatedTask is null
      setTasks(prevTasks => prevTasks.filter((_, i) => i !== index));
    } else {
      // Update the task as usual
      setTasks(prevTasks => prevTasks.map((task, i) => (i === index ? updatedTask : task)));
    }
  };

  return (
    <div className="task-list">
      <button className="add-task-button" onClick={() => addTask("New Task")}>
        + Add Task
      </button>
      {tasks.map((task, index) => (
        <TaskItem
          key={index}
          {...task}
          onUpdate={(updatedTask) => updateTask(index, updatedTask)}
        />
      ))}
    </div>
  );
}

export default TaskList;
