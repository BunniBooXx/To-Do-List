import { useState } from "react";
import TaskItem from "./TaskItem"; // Ensure TaskItem is imported correctly
import "./Calendar.css"; // Use the updated CSS for styling

export default function Calendar({ tasks = {}, onAddTaskToDate }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="calendar">
      <h1 className="calendar-title">My Calendar</h1>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div className="date-tasks">
        <h2>Tasks for {selectedDate}</h2>
        {(tasks[selectedDate] || []).map((task, index) => (
          <TaskItem
            key={index}
            {...task}
            onUpdate={(updatedTask) => {
              const updatedTasks = (tasks[selectedDate] || []).map((t, i) =>
                i === index ? updatedTask : t
              );
              onAddTaskToDate(selectedDate, updatedTasks);
            }}
          />
        ))}
      </div>
      <button
        className="add-task-button"
        onClick={() => onAddTaskToDate(selectedDate, [...(tasks[selectedDate] || []), { name: "New Task", done: false }])}
      >
        Add Task
      </button>
    </div>
  );
}
