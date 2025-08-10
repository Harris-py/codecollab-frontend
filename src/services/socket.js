// src/services/socket.js
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize socket connection
  connect(user) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners(user);
    return this.socket;
  }

  // Setup basic socket event listeners
  setupEventListeners(user) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate user
      if (user) {
        this.authenticate(user);
      }
      
      this.emit('custom:connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('custom:disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, manual reconnection needed
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to connect to server. Please refresh the page.');
      }
      
      this.emit('custom:connect_error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Connection restored');
      this.emit('custom:reconnected', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
      toast.error('Failed to reconnect. Please refresh the page.');
      this.emit('custom:reconnect_failed');
    });

    // Authentication events
    this.socket.on('auth-success', (data) => {
      console.log('✅ Socket authentication successful');
      this.emit('custom:auth-success', data);
    });

    this.socket.on('auth-error', (data) => {
      console.error('❌ Socket authentication failed:', data);
      toast.error(data.message || 'Authentication failed');
      this.emit('custom:auth-error', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'Connection error occurred');
      this.emit('custom:error', error);
    });
  }

  // Authenticate user with socket
  authenticate(user) {
    if (!this.socket?.connected) {
      console.warn('Cannot authenticate: socket not connected');
      return;
    }

    this.socket.emit('authenticate', {
      id: user.id,
      username: user.username,
      profile: user.profile,
    });
  }

  // Join a collaborative session
  joinSession(sessionId, user) {
    if (!this.socket?.connected) {
      console.warn('Cannot join session: socket not connected');
      return false;
    }

    this.socket.emit('join-session', {
      sessionId,
      user: {
        id: user.id,
        username: user.username,
        profile: user.profile,
      },
    });

    return true;
  }

  // Leave current session
  leaveSession(sessionId) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('leave-session', sessionId);
  }

  // Send code changes
  sendCodeChange(sessionId, code, operation) {
    if (!this.socket?.connected) return;

    this.socket.emit('code-change', {
      sessionId,
      code,
      operation,
      timestamp: Date.now(),
    });
  }

  // Send cursor position
  sendCursorPosition(sessionId, position) {
    if (!this.socket?.connected) return;

    this.socket.emit('cursor-position', {
      sessionId,
      position,
      timestamp: Date.now(),
    });
  }

  // Execute code
  executeCode(sessionId, code, language, input = '') {
    if (!this.socket?.connected) return;

    this.socket.emit('execute-code', {
      sessionId,
      code,
      language,
      input,
      timestamp: Date.now(),
    });
  }

  // Send chat message
  sendChatMessage(sessionId, message) {
    if (!this.socket?.connected) return;

    this.socket.emit('chat-message', {
      sessionId,
      message,
      timestamp: Date.now(),
    });
  }

  // Session event listeners
  onSessionJoined(callback) {
    this.on('user-joined', callback);
  }

  onSessionLeft(callback) {
    this.on('user-left', callback);
  }

  onCodeChange(callback) {
    this.on('code-change', callback);
  }

  onCodeSync(callback) {
    this.on('code-sync', callback);
  }

  onCursorUpdate(callback) {
    this.on('cursor-update', callback);
  }

  onTypingStatusUpdate(callback) {
    this.on('typing-status-update', callback);
  }

  onParticipants(callback) {
    this.on('session-participants', callback);
  }

  onParticipantCountUpdate(callback) {
    this.on('participant-count-update', callback);
  }

  onExecutionStarted(callback) {
    this.on('execution-started', callback);
  }

  onExecutionResult(callback) {
    this.on('execution-result', callback);
  }

  onExecutionError(callback) {
    this.on('execution-error', callback);
  }

  onChatMessage(callback) {
    this.on('chat-message', callback);
  }

  // Generic event listener management
  on(eventName, callback) {
    if (!this.socket) return;

    this.socket.on(eventName, callback);
    
    // Store for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(callback);
  }

  off(eventName, callback) {
    if (!this.socket) return;

    this.socket.off(eventName, callback);
    
    // Remove from stored listeners
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).delete(callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(eventName) {
    if (!this.socket) return;

    this.socket.removeAllListeners(eventName);
    this.eventListeners.delete(eventName);
  }

  // Emit custom events (for internal use)
  emit(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} listener:`, error);
        }
      });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      
      // Clean up all custom listeners
      this.eventListeners.clear();
      
      // Disconnect socket
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
    };
  }

  // Utility methods
  isConnectedToSession() {
    return this.isConnected && this.socket?.connected;
  }

  // Force reconnection
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  // Get socket instance (for advanced usage)
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;