import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { LocationProvider } from './contexts/LocationContext'; // For user/driver location updates

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar'; // Example of a global navigation bar

// Pages
import HomePage from './pages/HomePage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Global styles
import './App.css';

// PrivateRoute component to protect routes based on authentication and roles
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // Optionally render a loading spinner or placeholder
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to a forbidden page or home if user role is not allowed
    return <Navigate to="/" replace />; // Or to a specific /forbidden page
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <LocationProvider>
            <div className="app-container">
              <Header />
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/restaurants" element={<RestaurantListPage />} />
                  <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Authenticated Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/orders/:id/track"
                    element={
                      <PrivateRoute>
                        <OrderTrackingPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />

                  {/* Role-based Authenticated Routes */}
                  <Route
                    path="/driver/dashboard"
                    element={
                      <PrivateRoute allowedRoles={['driver']}>
                        <DriverDashboardPage />
                      </PrivateRoute>
                    }
                  />
                  {/* Add an admin dashboard route example if needed */}
                  {/* <Route
                    path="/admin/dashboard"
                    element={
                      <PrivateRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </PrivateRoute>
                    }
                  /> */}

                  {/* Catch-all for 404 Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </LocationProvider>
        </OrderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
