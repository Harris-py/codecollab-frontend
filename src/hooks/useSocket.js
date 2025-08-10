// src/hooks/useSocket.js
import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, user]);

  // Connect to socket
  const connectSocket = useCallback(async () => {
    if (!user || isConnecting) return;

    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');

      socketRef.current = socketService.connect(user);
      
      // Setup connection event listeners
      setupConnectionListeners();
      
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setConnectionStatus('error');
      toast.error('Failed to establish real-time connection');
    } finally {
      setIsConnecting(false);
    }
  }, [user, isConnecting]);

  // Setup basic connection listeners
  const setupConnectionListeners = useCallback(() => {
    if (!socketRef.current) return;

    // Connection status listeners
    socketService.on('custom:connected', () => {
      setConnectionStatus('connected');
      console.log('✅ Real-time connection established');
    });

    socketService.on('custom:disconnected', (reason) => {
      setConnectionStatus('disconnected');
      console.log('❌ Real-time connection lost:', reason);
    });

    socketService.on('custom:reconnected', () => {
      setConnectionStatus('connected');
      toast.success('Real-time connection restored');
    });

    socketService.on('custom:connect_error', (error) => {
      setConnectionStatus('error');
      console.error('Connection error:', error);
    });

    socketService.on('custom:auth-success', () => {
      console.log('✅ Socket authentication successful');
    });

    socketService.on('custom:auth-error', (error) => {
      console.error('❌ Socket authentication failed:', error);
      setConnectionStatus('auth-error');
    });
  }, []);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketService.disconnect();
      socketRef.current = null;
      setConnectionStatus('disconnected');
      
      // Clear all listeners
      listenersRef.current.clear();
    }
  }, []);

  // Force reconnection
  const reconnect = useCallback(() => {
    if (user) {
      disconnectSocket();
      setTimeout(() => connectSocket(), 1000);
    }
  }, [user, connectSocket, disconnectSocket]);

  // Generic event listener with cleanup
  const addEventListener = useCallback((eventName, callback) => {
    if (!socketRef.current) return () => {};

    socketService.on(eventName, callback);
    
    // Store listener for cleanup
    if (!listenersRef.current.has(eventName)) {
      listenersRef.current.set(eventName, new Set());
    }
    listenersRef.current.get(eventName).add(callback);

    // Return cleanup function
    return () => {
      socketService.off(eventName, callback);
      if (listenersRef.current.has(eventName)) {
        listenersRef.current.get(eventName).delete(callback);
      }
    };
  }, []);

  // Session management functions
  const joinSession = useCallback((sessionId) => {
    if (!socketRef.current || !user) {
      console.warn('Cannot join session: socket not connected or user not authenticated');
      return false;
    }

    return socketService.joinSession(sessionId, user);
  }, [user]);

  const leaveSession = useCallback((sessionId) => {
    if (socketRef.current) {
      socketService.leaveSession(sessionId);
    }
  }, []);

  // Code collaboration functions
  const sendCodeChange = useCallback((sessionId, code, operation) => {
    if (socketRef.current) {
      socketService.sendCodeChange(sessionId, code, operation);
    }
  }, []);

  const sendCursorPosition = useCallback((sessionId, position) => {
    if (socketRef.current) {
      socketService.sendCursorPosition(sessionId, position);
    }
  }, []);

  const executeCode = useCallback((sessionId, code, language, input = '') => {
    if (socketRef.current) {
      socketService.executeCode(sessionId, code, language, input);
    }
  }, []);

  const sendChatMessage = useCallback((sessionId, message) => {
    if (socketRef.current) {
      socketService.sendChatMessage(sessionId, message);
    }
  }, []);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    return socketService.getConnectionStatus();
  }, []);

  return {
    // Connection state
    connectionStatus,
    isConnecting,
    isConnected: connectionStatus === 'connected',
    
    // Connection management
    connect: connectSocket,
    disconnect: disconnectSocket,
    reconnect,
    
    // Event management
    addEventListener,
    
    // Session management
    joinSession,
    leaveSession,
    
    // Code collaboration
    sendCodeChange,
    sendCursorPosition,
    executeCode,
    sendChatMessage,
    
    // Utilities
    getConnectionInfo,
    socket: socketRef.current,
  };
};

// Hook for session-specific socket events
export const useSessionSocket = (sessionId) => {
  const socket = useSocket();
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [codeState, setCodeState] = useState('');
  const [cursors, setCursors] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [executionState, setExecutionState] = useState({
    isRunning: false,
    result: null,
    error: null,
  });

  // Join session when sessionId changes
  useEffect(() => {
    if (sessionId && socket.isConnected) {
      const success = socket.joinSession(sessionId);
      if (!success) {
        toast.error('Failed to join session');
      }
    }

    return () => {
      if (sessionId) {
        socket.leaveSession(sessionId);
      }
    };
  }, [sessionId, socket.isConnected]);

  // Setup session event listeners
  useEffect(() => {
    if (!socket.isConnected || !sessionId) return;

    const cleanupFunctions = [];

    // Code synchronization
    cleanupFunctions.push(
      socket.addEventListener('code-sync', (data) => {
        setCodeState(data.code);
      })
    );

    cleanupFunctions.push(
      socket.addEventListener('code-change', (data) => {
        setCodeState(data.code);
      })
    );

    // Participants management
    cleanupFunctions.push(
      socket.addEventListener('session-participants', (participantsList) => {
        setParticipants(participantsList);
      })
    );

    cleanupFunctions.push(
      socket.addEventListener('user-joined', (data) => {
        setParticipants(prev => [...prev, data.user]);
        toast.success(`${data.user.username} joined the session`);
      })
    );

    cleanupFunctions.push(
      socket.addEventListener('user-left', (data) => {
        setParticipants(prev => 
          prev.filter(p => p.socketId !== data.socketId)
        );
        toast(`${data.user.username} left the session`);
      })
    );

    // Cursor tracking
    cleanupFunctions.push(
      socket.addEventListener('cursor-update', (data) => {
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.set(data.socketId, {
            username: data.username,
            position: data.position,
            color: data.color,
          });
          return newCursors;
        });
      })
    );

    // Typing indicators
    cleanupFunctions.push(
      socket.addEventListener('typing-status-update', (data) => {
        setTypingUsers(prev => {
          const newTypingUsers = new Set(prev);
          if (data.isTyping) {
            newTypingUsers.add(data.username);
          } else {
            newTypingUsers.delete(data.username);
          }
          return newTypingUsers;
        });
      })
    );

    // Code execution
    cleanupFunctions.push(
      socket.addEventListener('execution-started', (data) => {
        setExecutionState({
          isRunning: true,
          result: null,
          error: null,
          executedBy: data.username,
        });
      })
    );

    cleanupFunctions.push(
      socket.addEventListener('execution-result', (data) => {
        setExecutionState({
          isRunning: false,
          result: data.result,
          error: null,
          executedBy: data.executedBy,
        });
      })
    );

    cleanupFunctions.push(
      socket.addEventListener('execution-error', (data) => {
        setExecutionState({
          isRunning: false,
          result: null,
          error: data.error,
        });
      })
    );

    // Chat messages
    cleanupFunctions.push(
      socket.addEventListener('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
      })
    );

    // Cleanup all listeners
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [socket.isConnected, sessionId, socket.addEventListener]);

  // Session-specific actions
  const sendCode = useCallback((code, operation) => {
    socket.sendCodeChange(sessionId, code, operation);
  }, [socket, sessionId]);

  const sendCursor = useCallback((position) => {
    socket.sendCursorPosition(sessionId, position);
  }, [socket, sessionId]);

  const runCode = useCallback((code, language, input) => {
    socket.executeCode(sessionId, code, language, input);
  }, [socket, sessionId]);

  const sendMessage = useCallback((message) => {
    socket.sendChatMessage(sessionId, message);
  }, [socket, sessionId]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  return {
    // Session state
    participants,
    chatMessages,
    codeState,
    cursors,
    typingUsers,
    executionState,
    
    // Session actions
    sendCode,
    sendCursor,
    runCode,
    sendMessage,
    clearChat,
    
    // Connection state from parent hook
    isConnected: socket.isConnected,
    connectionStatus: socket.connectionStatus,
  };
};

// Hook for code editor specific socket events
export const useCodeEditorSocket = (sessionId, onCodeChange) => {
  const socket = useSocket();
  const debounceTimeoutRef = useRef(null);

  // Send code changes with debouncing
  const sendCodeChange = useCallback((code, operation = 'edit') => {
    if (!socket.isConnected || !sessionId) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce code changes to avoid flooding
    debounceTimeoutRef.current = setTimeout(() => {
      socket.sendCodeChange(sessionId, code, operation);
    }, 300);
  }, [socket, sessionId]);

  // Send cursor position (no debouncing needed)
  const sendCursorPosition = useCallback((position) => {
    if (socket.isConnected && sessionId) {
      socket.sendCursorPosition(sessionId, position);
    }
  }, [socket, sessionId]);

  // Setup code editor specific listeners
  useEffect(() => {
    if (!socket.isConnected || !sessionId) return;

    const cleanupFunctions = [];

    // Listen for code changes from other users
    cleanupFunctions.push(
      socket.addEventListener('code-change', (data) => {
        if (onCodeChange) {
          onCodeChange(data.code, data.operation, data.from);
        }
      })
    );

    // Listen for initial code sync
    cleanupFunctions.push(
      socket.addEventListener('code-sync', (data) => {
        if (onCodeChange) {
          onCodeChange(data.code, 'sync', 'server');
        }
      })
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [socket.isConnected, sessionId, onCodeChange, socket.addEventListener]);

  return {
    sendCodeChange,
    sendCursorPosition,
    isConnected: socket.isConnected,
  };
};