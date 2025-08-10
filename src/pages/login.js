// src/pages/Login.js
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSuccess = (user) => {
    console.log('Login successful:', user);
    // Navigate to intended destination or dashboard
    navigate(from, { replace: true });
  };

  // Add some animations on mount
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Auth Header */}
      <header className="border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-heading gradient-text">CodeCollab</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-tertiary transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl flex items-center justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Welcome Message */}
            <div className="hidden lg:block text-center lg:text-left">
              <div className="animate-slide-in">
                <h1 className="text-4xl xl:text-5xl font-heading gradient-text mb-6">
                  Welcome Back to CodeCollab
                </h1>
                
                <p className="text-xl text-secondary mb-8 leading-relaxed">
                  Continue your collaborative coding journey. Join sessions, 
                  execute code, and build amazing projects together.
                </p>

                {/* Feature Highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                      <span className="text-success">⚡</span>
                    </div>
                    <span className="text-secondary">Real-time collaborative editing</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                      <span className="text-success">🚀</span>
                    </div>
                    <span className="text-secondary">Execute code in 7+ languages</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                      <span className="text-success">💬</span>
                    </div>
                    <span className="text-secondary">Live chat and video calls</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                      <span className="text-success">📊</span>
                    </div>
                    <span className="text-secondary">Session history and analytics</span>
                  </div>
                </div>

                {/* Recent Sessions Preview */}
                <div className="bg-secondary/50 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-primary mb-4">
                    🔥 Popular Sessions Right Now
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-tertiary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-xs text-white font-bold">
                          JS
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">React Hooks Tutorial</p>
                          <p className="text-xs text-secondary">8 participants</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Live</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-tertiary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-bold">
                          PY
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Data Science Workshop</p>
                          <p className="text-xs text-secondary">12 participants</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Live</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-tertiary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-xs text-white font-bold">
                          JV
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Spring Boot API</p>
                          <p className="text-xs text-secondary">5 participants</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-warning text-white text-xs rounded-full">Joining</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Link 
                to="/about" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                About
              </Link>
              <Link 
                to="/help" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Help
              </Link>
              <Link 
                to="/contact" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-secondary text-xs mb-1">
                New to CodeCollab?{' '}
                <Link 
                  to="/register" 
                  className="text-accent hover:text-accent-secondary transition-colors"
                >
                  Create an account
                </Link>
              </p>
              <p className="text-secondary text-xs">
                © 2024 CodeCollab. Made with ❤️ for developers.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-3xl animate-pulse-accent" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent-secondary rounded-full blur-3xl animate-pulse-accent" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse-accent" style={{ animationDelay: '4s' }} />
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .auth-page {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default Login;