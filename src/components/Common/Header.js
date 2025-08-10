// src/components/Common/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from './LoadingSpinner';
import { clsx } from 'clsx';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connectionStatus } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-success', text: 'Connected' };
      case 'connecting':
        return { color: 'bg-warning', text: 'Connecting...' };
      case 'disconnected':
        return { color: 'bg-error', text: 'Disconnected' };
      default:
        return { color: 'bg-secondary', text: 'Offline' };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  const isActiveRoute = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null; // Don't show header on public pages
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-primary glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-heading gradient-text hidden sm:block">
                CodeCollab
              </span>
            </Link>

            {/* Connection Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-tertiary rounded-full">
              <div className={clsx('w-2 h-2 rounded-full', connectionInfo.color)} />
              <span className="text-xs text-secondary">{connectionInfo.text}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActiveRoute('/dashboard')
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary hover:bg-tertiary'
              )}
            >
              Dashboard
            </Link>
            
            {/* Quick Actions */}
            <button 
              onClick={() => navigate('/dashboard?action=create')}
              className="btn-primary btn-sm"
            >
              Create Session
            </button>
          </nav>

          {/* Desktop User Menu & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
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

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-tertiary transition-colors"
              >
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {user?.username}
                </span>
                <svg 
                  className={clsx(
                    'w-4 h-4 text-secondary transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary border border-primary rounded-lg shadow-lg animate-slide-in">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-primary">
                      <p className="text-sm font-medium text-primary">{user?.username}</p>
                      <p className="text-xs text-secondary">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard?tab=profile"
                      className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      👤 Profile Settings
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=preferences"
                      className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      ⚙️ Preferences
                    </Link>
                    
                    <Link
                      to="/dashboard?tab=stats"
                      className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📊 Statistics
                    </Link>
                    
                    <div className="border-t border-primary mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-tertiary transition-colors"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-tertiary transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-tertiary transition-colors"
            >
              <svg 
                className="w-6 h-6 text-primary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary bg-secondary animate-slide-in">
            <div className="py-4 space-y-2">
              {/* Connection Status Mobile */}
              <div className="flex items-center justify-center space-x-2 px-4 py-2">
                <div className={clsx('w-2 h-2 rounded-full', connectionInfo.color)} />
                <span className="text-xs text-secondary">{connectionInfo.text}</span>
              </div>

              {/* Navigation Links */}
              <Link
                to="/dashboard"
                className={clsx(
                  'block px-4 py-3 text-base font-medium rounded-lg mx-2 transition-colors',
                  isActiveRoute('/dashboard')
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:text-primary hover:bg-tertiary'
                )}
              >
                📊 Dashboard
              </Link>

              {/* Quick Actions */}
              <button 
                onClick={() => {
                  navigate('/dashboard?action=create');
                  setMobileMenuOpen(false);
                }}
                className="w-full mx-2 btn-primary"
              >
                ➕ Create Session
              </button>

              {/* User Section */}
              <div className="border-t border-primary mt-4 pt-4">
                <div className="px-4 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-primary">{user?.username}</p>
                      <p className="text-xs text-secondary">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <Link
                    to="/dashboard?tab=profile"
                    className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors rounded-lg mx-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Profile Settings
                  </Link>
                  
                  <Link
                    to="/dashboard?tab=preferences"
                    className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors rounded-lg mx-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ⚙️ Preferences
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-tertiary transition-colors rounded-lg mx-2"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;