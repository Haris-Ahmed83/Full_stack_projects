import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound'; // Optional: 404 page

// Auth Context and Private Route
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/create" element={<CreatePost />} />
                <Route path="/edit/:id" element={<EditPost />} />
              </Route>

              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
