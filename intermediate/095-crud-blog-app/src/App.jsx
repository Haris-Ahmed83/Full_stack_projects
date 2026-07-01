import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your page components
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound'; // A simple 404 page

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/create" className="nav-link">Create New Post</Link>
              </li>
            </ul>
          </nav>
          <h1>CRUD Blog App</h1>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="*" element={<NotFound />} /> {/* Catch-all for 404 */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
