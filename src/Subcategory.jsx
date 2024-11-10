import { useParams } from "react-router-dom";
import { useState } from "react";
import "./Subcategory.css";

export default function Subcategory({ tasks = [] }) { // Default to an empty array
  const { taskId } = useParams();
  const task = tasks.find((t) => t.id === taskId);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);

  const updateSubtasks = (updatedSubtask, index) => {
    const newSubtasks = subtasks.map((subtask, i) =>
      i === index ? updatedSubtask : subtask
    );
    setSubtasks(newSubtasks);
  };

  return (
    <div className="subcategory-page">
      <h1 className="subcategory-title">{task?.name || "Task Not Found"}</h1>
      <div className="subcategory-list">
        {subtasks.map((subtask, index) => (
          <div key={index} className="subcategory-item">
            <span>{subtask.name}</span>
            <button onClick={() => updateSubtasks({ ...subtask, done: !subtask.done }, index)}>
              {subtask.done ? "❤️" : "🤍"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

