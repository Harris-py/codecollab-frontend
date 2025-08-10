// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Header from './components/Common/Header';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';

// Hooks
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" />
          <p className="text-secondary">Loading CodeCollab...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" />
          <p className="text-secondary">Loading CodeCollab...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// Main App Router Component
const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" />
          <div className="text-center">
            <h2 className="text-xl font-heading gradient-text mb-2">CodeCollab</h2>
            <p className="text-secondary">Initializing application...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Header - show on all pages except login/register */}
      <Routes>
        <Route 
          path="/login" 
          element={null} 
        />
        <Route 
          path="/register" 
          element={null} 
        />
        <Route 
          path="*" 
          element={<Header />} 
        />
      </Routes>

      {/* Main Content */}
      <main className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/session/:sessionId" 
            element={
              <ProtectedRoute>
                <Session />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-heading gradient-text mb-4">404</h1>
                  <p className="text-secondary mb-6">Page not found</p>
                  <Navigate to={isAuthenticated ? "/dashboard" : "/"} />
                </div>
              </div>
            } 
          />
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'toast',
          success: {
            className: 'toast toast-success',
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            className: 'toast toast-error',
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            className: 'toast toast-info',
          },
        }}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  // Global app initialization
  useEffect(() => {
    // Set initial theme on app load
    const savedTheme = localStorage.getItem('codecollab-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Set app title
    document.title = 'CodeCollab - Real-time Collaborative Coding';

    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'CodeCollab - Collaborate on code in real-time with multiple programming languages, live editing, and instant execution.'
      );
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('🌐 Application is online');
    };

    const handleOffline = () => {
      console.log('📱 Application is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRouter />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;