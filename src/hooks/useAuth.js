// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, apiUtils } from '../services/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = apiUtils.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user profile
      const profileData = await authAPI.getProfile();
      setUser(profileData.user);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid token
      apiUtils.clearToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      // Store token
      apiUtils.setToken(response.token);
      
      // Set user state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success(response.message || 'Login successful!');
      return { success: true, user: response.user };
      
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      // Store token
      apiUtils.setToken(response.token);
      
      // Set user state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success(response.message || 'Account created successfully!');
      return { success: true, user: response.user };
      
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local state
      apiUtils.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      toast.success(response.message || 'Profile updated successfully!');
      return { success: true, user: response.user };
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await authAPI.updatePreferences(preferences);
      setUser(prev => ({
        ...prev,
        preferences: response.preferences
      }));
      toast.success('Preferences updated successfully!');
      return { success: true, preferences: response.preferences };
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      toast.success(response.message || 'Password changed successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete account
  const deleteAccount = async (password) => {
    try {
      const response = await authAPI.deleteAccount(password);
      
      // Clear local state
      apiUtils.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success(response.message || 'Account deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const profileData = await authAPI.getProfile();
      setUser(profileData.user);
      return { success: true, user: profileData.user };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error: apiUtils.formatError(error) };
    }
  };

  // Get user stats
  const getUserStats = async () => {
    try {
      const response = await authAPI.getStats();
      return { success: true, stats: response.stats };
    } catch (error) {
      const errorMessage = apiUtils.formatError(error);
      return { success: false, error: errorMessage };
    }
  };

  // Context value
  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
    refreshUser,
    getUserStats,
    
    // Utils
    token: apiUtils.getToken(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for checking auth status
export const useAuthStatus = () => {
  const { isAuthenticated, loading } = useAuth();
  return { isAuthenticated, loading };
};

// Custom hook for user data
export const useUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
};

// Custom hook for auth actions only
export const useAuthActions = () => {
  const { 
    login, 
    register, 
    logout, 
    updateProfile, 
    updatePreferences, 
    changePassword, 
    deleteAccount,
    refreshUser,
    getUserStats
  } = useAuth();
  
  return {
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
    refreshUser,
    getUserStats,
  };
};