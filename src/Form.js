import React from 'react';
import { useState } from "react";
import "./Form.css";


export default function Form({onAdd}) {
    const [taskName, setTaskName] = useState('');

    function handleSubmit(ev) {
        ev.preventDefault();
        onAdd(taskName);
        setTaskName('');
    }

  return (
    <form onClick={handleSubmit}>
        <button>+</button>
        <input type="text" value={taskName} onChange={ev=> setTaskName(ev.target.value)} placeholder= "Enter Task"/>
    </form>
  );
}

