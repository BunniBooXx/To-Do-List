import React from 'react';
import TaskList from './TaskList';
import './TasksPage.css';

function TasksPage() {
  return (
    <div className="tasks-page">
      <h1 className="tasks-title">To-Do List</h1>
      <TaskList />
    </div>
  );
}

export default TasksPage;

