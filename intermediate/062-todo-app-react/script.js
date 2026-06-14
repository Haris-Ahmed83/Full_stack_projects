import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

// TodoItem Component: Displays a single todo item
function TodoItem({ todo, onDelete, onToggleComplete }) {
  return (
    <li style={{ textDecoration: todo.completed ? 'line-through' : 'none', display: 'flex', alignItems: 'center', marginBottom: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fff' }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id)}
        style={{ marginRight: '10px', transform: 'scale(1.2)' }}
      />
      <span style={{ flexGrow: 1, fontSize: '1.1em', color: '#333' }}>{todo.text}</span>
      <button 
        onClick={() => onDelete(todo.id)} 
        style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
      >
        Delete
      </button>
    </li>
  );
}

// TodoList Component: Renders a list of todo items
function TodoList({ todos, onDeleteTodo, onToggleComplete }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDeleteTodo}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </ul>
  );
}

// TodoForm Component: Handles adding new todo items
function TodoForm({ onAddTodo }) {
  const [newTodoText, setNewTodoText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return; // Prevent adding empty todos
    onAddTodo(newTodoText); // Call the prop function to add todo
    setNewTodoText(''); // Clear input field
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <input
        type="text"
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        placeholder="Add a new todo..."
        style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em' }}
      />
      <button 
        type="submit" 
        style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}
      >
        Add Todo
      </button>
    </form>
  );
}

// App Component: Main application component, manages state and logic
function App() {
  // State to store the list of todos
  const [todos, setTodos] = useState([]);

  // CRUD Operation: Add a new todo
  const handleAddTodo = (text) => {
    const newTodo = {
      id: Date.now(), // Simple unique ID
      text,
      completed: false,
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
  };

  // CRUD Operation: Delete a todo by its ID
  const handleDeleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  // CRUD Operation: Toggle the completion status of a todo
  const handleToggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>My Todo List</h1>
      
      {/* TodoForm component for adding new todos */}
      {/* Lifting State Up: onAddTodo handler is passed down as a prop */}
      <TodoForm onAddTodo={handleAddTodo} />
      
      {/* TodoList component to display todos */}
      {/* Props: todos array and CRUD handlers are passed down */}
      <TodoList
        todos={todos}
        onDeleteTodo={handleDeleteTodo}
        onToggleComplete={handleToggleComplete}
      />

      {todos.length === 0 && <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>No todos yet! Add some above.</p>}
    </div>
  );
}

// Render the App component into the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
