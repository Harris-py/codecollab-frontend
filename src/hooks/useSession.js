// src/hooks/useSession.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionAPI, executeAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

// Hook for managing individual session state
export const useSession = (sessionId) => {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codeHistory, setCodeHistory] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);

  // Load session data
  const loadSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await sessionAPI.getById(sessionId);
      setSession(response.session);
      
      // Load session history if user has access
      if (response.session) {
        loadSessionHistory();
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load session');
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Load session history
  const loadSessionHistory = useCallback(async () => {
    try {
      const response = await sessionAPI.getHistory(sessionId);
      setCodeHistory(response.codeHistory || []);
      setExecutionHistory(response.history || []);
    } catch (err) {
      console.error('Failed to load session history:', err);
    }
  }, [sessionId]);

  // Update session settings
  const updateSession = useCallback(async (updateData) => {
    try {
      const response = await sessionAPI.update(sessionId, updateData);
      setSession(response.session);
      toast.success(response.message || 'Session updated successfully');
      return { success: true, session: response.session };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update session';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [sessionId]);

  // Leave session
  const leaveSession = useCallback(async () => {
    try {
      const response = await sessionAPI.leave(sessionId);
      toast.success(response.message || 'Left session successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to leave session';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [sessionId]);

  // End/Delete session
  const endSession = useCallback(async () => {
    try {
      const response = await sessionAPI.delete(sessionId);
      toast.success(response.message || 'Session ended successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to end session';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [sessionId]);

  // Check if current user is session creator
  const isCreator = session?.creator?._id === user?.id || session?.creator === user?.id;

  // Check if current user can edit
  const canEdit = session?.activeParticipants?.some(
    p => p.user._id === user?.id && (p.role === 'creator' || p.role === 'editor')
  ) || isCreator;

  // Check if session can accept more participants
  const canJoin = session?.canJoin;

  // Load session on mount and when sessionId changes
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    loading,
    error,
    codeHistory,
    executionHistory,
    isCreator,
    canEdit,
    canJoin,
    
    // Actions
    loadSession,
    updateSession,
    leaveSession,
    endSession,
    refreshHistory: loadSessionHistory,
  };
};

// Hook for managing session creation
export const useCreateSession = () => {
  const [loading, setLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);

  // Load supported languages on mount
  useEffect(() => {
    loadSupportedLanguages();
  }, []);

  const loadSupportedLanguages = async () => {
    try {
      const response = await executeAPI.getLanguages();
      setSupportedLanguages(response.languages || []);
    } catch (error) {
      console.error('Failed to load supported languages:', error);
      // Fallback to default languages
      setSupportedLanguages([
        { name: 'javascript', displayName: 'JavaScript', available: true },
        { name: 'python', displayName: 'Python', available: true },
        { name: 'cpp', displayName: 'C++', available: true },
        { name: 'c', displayName: 'C', available: true },
        { name: 'java', displayName: 'Java', available: true },
        { name: 'go', displayName: 'Go', available: true },
        { name: 'rust', displayName: 'Rust', available: true },
      ]);
    }
  };

  const createSession = async (sessionData) => {
    try {
      setLoading(true);
      const response = await sessionAPI.create(sessionData);
      toast.success(response.message || 'Session created successfully!');
      return { 
        success: true, 
        session: response.session, 
        sessionCode: response.sessionCode 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create session';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSession,
    loading,
    supportedLanguages,
  };
};

// Hook for joining sessions
export const useJoinSession = () => {
  const [loading, setLoading] = useState(false);

  const joinSession = async (sessionCode) => {
    try {
      setLoading(true);
      const response = await sessionAPI.join(sessionCode);
      toast.success(response.message || 'Joined session successfully!');
      return { 
        success: true, 
        session: response.session, 
        role: response.role 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to join session';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getSessionByCode = async (sessionCode) => {
    try {
      setLoading(true);
      const response = await sessionAPI.getByCode(sessionCode);
      return { success: true, session: response.session };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Session not found';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    joinSession,
    getSessionByCode,
    loading,
  };
};

// Hook for managing user's sessions list
export const useUserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publicSessions, setPublicSessions] = useState([]);

  const loadUserSessions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await sessionAPI.getUserSessions(filters);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load user sessions:', error);
      toast.error('Failed to load your sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPublicSessions = useCallback(async (limit = 20) => {
    try {
      const response = await sessionAPI.getPublicSessions(limit);
      setPublicSessions(response.sessions || []);
    } catch (error) {
      console.error('Failed to load public sessions:', error);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadUserSessions();
    loadPublicSessions();
  }, [loadUserSessions, loadPublicSessions]);

  return {
    sessions,
    publicSessions,
    loading,
    
    // Actions
    loadUserSessions,
    loadPublicSessions,
    refreshSessions: loadUserSessions,
  };
};

// Hook for code execution
export const useCodeExecution = (sessionId) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);

  const executeCode = useCallback(async (code, language, input = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await executeAPI.run({
        code,
        language,
        input,
        sessionId,
      });

      setResult(response.result);
      
      // Add to local execution history
      setExecutionHistory(prev => [
        {
          code,
          language,
          input,
          result: response.result,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19) // Keep last 20 executions
      ]);

      return { success: true, result: response.result };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Code execution failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const validateCode = useCallback(async (code, language) => {
    try {
      const response = await executeAPI.validate({ code, language });
      return { 
        success: true, 
        valid: response.valid, 
        errors: response.errors,
        warnings: response.warnings 
      };
    } catch (err) {
      return { success: false, error: 'Validation failed' };
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
  }, []);

  return {
    loading,
    result,
    error,
    executionHistory,
    
    // Actions
    executeCode,
    validateCode,
    clearResult,
    clearHistory,
  };
};