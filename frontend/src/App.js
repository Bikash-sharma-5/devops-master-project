import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://54.226.117.187:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API_URL);
    setTasks(res.data);
  };

  const addTask = async () => {
    await axios.post(API_URL, form);
    setForm({ title: '', description: '' });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Managers (DevOps )</h1>
      <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <input placeholder="Desc" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
      <button onClick={addTask}>Add Task</button>

      <ul>
        {tasks.map(t => (
          <li key={t._id}>
            {t.title} - {t.description} 
            <button onClick={() => deleteTask(t._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;