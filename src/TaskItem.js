import { useState } from "react";
import { Link } from "react-router-dom";
import "./TaskItem.css";

export default function TaskItem({ name, done, subtasks = [], onUpdate, taskId }) {
  const [editMode, setEditMode] = useState(false);
  const [taskName, setTaskName] = useState(name);
  const [subTaskList, setSubTaskList] = useState(subtasks);
  const [showSubTasks, setShowSubTasks] = useState(false);

  const toggleDone = () => {
    onUpdate({ name: taskName, done: !done, subtasks: subTaskList });
  };

  const addSubTask = (subTaskName) => {
    const newSubTasks = [...subTaskList, { name: subTaskName, done: false }];
    setSubTaskList(newSubTasks);
    onUpdate({ name: taskName, done, subtasks: newSubTasks });
  };

  return (
    <div className={`task-item ${done ? "done" : ""}`}>
      <div className="heart-checkbox" onClick={toggleDone}>
        {done ? "❤️" : "🤍"}
      </div>
      {!editMode && (
        <div className="task-name" onClick={() => !done && setEditMode(true)}>
          <span>{taskName}</span>
        </div>
      )}
      {editMode && !done && (
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={() => setEditMode(false)}
        />
      )}
      <button
        className={`cute-arrow-button ${showSubTasks ? "expanded" : ""}`}
        onClick={() => setShowSubTasks(!showSubTasks)}
      >
        {showSubTasks ? "💖" :  "🎀"}
      </button>
      {showSubTasks && (
        <div className="subtasks">
          {subTaskList.map((subTask, index) => (
            <TaskItem
              key={index}
              {...subTask}
              onUpdate={(updatedSubTask) => {
                const updatedSubTasks = subTaskList.map((st, i) =>
                  i === index ? updatedSubTask : st
                );
                setSubTaskList(updatedSubTasks);
                onUpdate({ name: taskName, done, subtasks: updatedSubTasks });
              }}
            />
          ))}
          <input
            type="text"
            placeholder="Add Subtask"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addSubTask(e.target.value);
                e.target.value = "";
              }
            }}
          />
          <Link to={`/subcategory/${taskId}`} className="view-subcategory-link">
            View Subcategory
          </Link>
        </div>
      )}
      <button className="trash" onClick={() => onUpdate(null)}>🗑️</button>
    </div>
  );
}

