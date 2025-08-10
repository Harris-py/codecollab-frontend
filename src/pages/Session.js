// src/pages/Session.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useSessionSocket } from '../hooks/useSocket';
import { useCodeExecution } from '../hooks/useSession';
import { useTheme } from '../contexts/ThemeContext';
import CodeEditor from '../components/Session/CodeEditor';
import ParticipantsList from '../components/Session/ParticipantsList';
import ChatWindow from '../components/Session/ChatWindow';
import ExecutionPanel from '../components/Session/ExecutionPanel';
import LoadingSpinner, { PageLoading } from '../components/Common/LoadingSpinner';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const Session = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // Session data and management
  const { 
    session, 
    loading: sessionLoading, 
    error: sessionError, 
    isCreator, 
    canEdit,
    updateSession,
    leaveSession: leaveSessionAPI,
    endSession 
  } = useSession(sessionId);

  // Real-time collaboration
  const {
    participants,
    chatMessages,
    codeState,
    cursors,
    typingUsers,
    executionState,
    sendCode,
    sendCursor,
    runCode,
    sendMessage,
    isConnected,
    connectionStatus
  } = useSessionSocket(sessionId);

  // Code execution
  const {
    executeCode,
    result: localExecutionResult,
    loading: executionLoading,
    error: executionError
  } = useCodeExecution(sessionId);

  // Local state
  const [code, setCode] = useState('');
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showExecution, setShowExecution] = useState(true);
  const [layout, setLayout] = useState('default'); // default, focus, minimal
  const [showSettings, setShowSettings] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Session settings form
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    maxParticipants: 5,
    isPublic: false,
    allowAnonymous: false,
    executionEnabled: true,
  });

  // Initialize settings form when session loads
  useEffect(() => {
    if (session) {
      setSettingsForm({
        name: session.name || '',
        description: session.description || '',
        maxParticipants: session.settings?.maxParticipants || 5,
        isPublic: session.settings?.isPublic || false,
        allowAnonymous: session.settings?.allowAnonymous || false,
        executionEnabled: session.settings?.executionEnabled ?? true,
      });
    }
  }, [session]);

  // Sync code state from socket
  useEffect(() => {
    if (codeState && codeState !== code) {
      setCode(codeState);
    }
  }, [codeState]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && code && session) {
      const saveTimer = setTimeout(() => {
        setLastSavedAt(new Date());
        // You can implement actual saving logic here
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [code, autoSave, session]);

  // Handle session not found or access denied
  useEffect(() => {
    if (sessionError && !sessionLoading) {
      toast.error(sessionError);
      navigate('/dashboard');
    }
  }, [sessionError, sessionLoading, navigate]);

  // Handle code changes
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (isConnected) {
      sendCode(newCode, 'edit');
    }
  }, [isConnected, sendCode]);

  // Handle code execution
  const handleExecuteCode = useCallback(async (codeToExecute) => {
    if (!session?.settings?.executionEnabled) {
      toast.error('Code execution is disabled for this session');
      return;
    }

    const codeToRun = codeToExecute || code;
    
    if (!codeToRun.trim()) {
      toast.error('Please write some code to execute');
      return;
    }

    try {
      // Use socket for real-time execution if connected
      if (isConnected) {
        runCode(codeToRun, session.language, '');
      } else {
        // Fallback to direct API call
        await executeCode(codeToRun, session.language, '');
      }
    } catch (error) {
      toast.error('Failed to execute code');
    }
  }, [code, session?.language, session?.settings?.executionEnabled, isConnected, runCode, executeCode]);

  // Handle leaving session
  const handleLeaveSession = useCallback(async () => {
    if (isLeaving) return;
    
    setIsLeaving(true);
    
    try {
      await leaveSessionAPI();
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to leave session');
      setIsLeaving(false);
    }
  }, [isLeaving, leaveSessionAPI, navigate]);

  // Handle ending session (creator only)
  const handleEndSession = useCallback(async () => {
    if (!isCreator) return;

    const confirmed = window.confirm(
      'Are you sure you want to end this session? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await endSession();
      toast.success('Session ended successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to end session');
    }
  }, [isCreator, endSession, navigate]);

  // Handle session settings update
  const handleUpdateSettings = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isCreator) return;

    try {
      await updateSession(settingsForm);
      setShowSettings(false);
    } catch (error) {
      // Error already handled by updateSession
    }
  }, [isCreator, updateSession, settingsForm]);

  // Handle layout changes
  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
    
    // Adjust panel visibility based on layout
    switch (newLayout) {
      case 'focus':
        setShowParticipants(false);
        setShowChat(false);
        setShowExecution(true);
        break;
      case 'minimal':
        setShowParticipants(false);
        setShowChat(false);
        setShowExecution(false);
        break;
      default:
        setShowParticipants(true);
        setShowChat(true);
        setShowExecution(true);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecuteCode();
      }
      
      // Ctrl/Cmd + Shift + P to toggle participants
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowParticipants(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + C to toggle chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowChat(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + E to toggle execution
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setShowExecution(prev => !prev);
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecuteCode]);

  // Loading state
  if (sessionLoading) {
    return <PageLoading message="Loading session..." />;
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-heading text-primary mb-2">Session Error</h1>
          <p className="text-secondary mb-6">{sessionError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // No session found
  if (!session) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-heading text-primary mb-2">Session Not Found</h1>
          <p className="text-secondary mb-6">The session you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'text-success', icon: '🟢', text: 'Connected' };
      case 'connecting':
        return { color: 'text-warning', icon: '🟡', text: 'Connecting...' };
      case 'disconnected':
        return { color: 'text-error', icon: '🔴', text: 'Disconnected' };
      default:
        return { color: 'text-secondary', icon: '⚫', text: 'Offline' };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden">
      {/* Session Header */}
      <header className="bg-secondary border-b border-primary px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Session Info */}
            <div>
              <h1 className="text-lg font-heading text-primary flex items-center space-x-2">
                <span>{session.name}</span>
                {session.settings?.isPublic && (
                  <span className="px-2 py-1 bg-success text-white text-xs rounded-full">Public</span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-secondary">
                <span className="font-code">{session.sessionCode}</span>
                <span>•</span>
                <span className="capitalize">{session.language}</span>
                <span>•</span>
                <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-tertiary rounded-lg">
              <span>{connectionInfo.icon}</span>
              <span className={clsx('text-xs', connectionInfo.color)}>
                {connectionInfo.text}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {/* Layout Toggle */}
            <div className="flex items-center space-x-1 bg-tertiary rounded-lg p-1">
              <button
                onClick={() => handleLayoutChange('default')}
                className={clsx(
                  'px-2 py-1 rounded text-xs transition-colors',
                  layout === 'default' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                )}
                title="Default Layout"
              >
                ⚏
              </button>
              <button
                onClick={() => handleLayoutChange('focus')}
                className={clsx(
                  'px-2 py-1 rounded text-xs transition-colors',
                  layout === 'focus' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                )}
                title="Focus Mode"
              >
                ◐
              </button>
              <button
                onClick={() => handleLayoutChange('minimal')}
                className={clsx(
                  'px-2 py-1 rounded text-xs transition-colors',
                  layout === 'minimal' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                )}
                title="Minimal Mode"
              >
                ◯
              </button>
            </div>

            {/* Panel Toggles */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={clsx(
                  'btn-ghost btn-sm',
                  showParticipants && 'bg-accent text-white'
                )}
                title="Toggle Participants (Ctrl+Shift+P)"
              >
                👥
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={clsx(
                  'btn-ghost btn-sm',
                  showChat && 'bg-accent text-white'
                )}
                title="Toggle Chat (Ctrl+Shift+C)"
              >
                💬
              </button>
              <button
                onClick={() => setShowExecution(!showExecution)}
                className={clsx(
                  'btn-ghost btn-sm',
                  showExecution && 'bg-accent text-white'
                )}
                title="Toggle Execution (Ctrl+Shift+E)"
              >
                ▶
              </button>
            </div>

            {/* Settings */}
            {isCreator && (
              <button
                onClick={() => setShowSettings(true)}
                className="btn-ghost btn-sm"
                title="Session Settings"
              >
                ⚙️
              </button>
            )}

            {/* Copy Session Code */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(session.sessionCode);
                toast.success('Session code copied!');
              }}
              className="btn-ghost btn-sm"
              title="Copy Session Code"
            >
              📋
            </button>

            {/* Leave Session */}
            <button
              onClick={handleLeaveSession}
              disabled={isLeaving}
              className="btn-danger btn-sm"
              title="Leave Session"
            >
              {isLeaving ? <LoadingSpinner size="xs" color="white" /> : '🚪'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-64 bg-sidebar border-r border-primary flex-shrink-0">
            <ParticipantsList
              participants={participants}
              currentUser={user}
              isCreator={isCreator}
              session={session}
              cursors={cursors}
              typingUsers={typingUsers}
            />
          </div>
        )}

        {/* Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1">
            <CodeEditor
              sessionId={sessionId}
              language={session.language}
              onCodeChange={handleCodeChange}
              onExecute={handleExecuteCode}
              readOnly={!canEdit}
              className="h-full"
            />
          </div>

          {/* Execution Panel */}
          {showExecution && (
            <div className="h-64 border-t border-primary">
              <ExecutionPanel
                sessionId={sessionId}
                language={session.language}
                executionState={executionState}
                localResult={localExecutionResult}
                loading={executionLoading}
                error={executionError}
                onExecute={handleExecuteCode}
                canExecute={canEdit && session.settings?.executionEnabled}
              />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-sidebar border-l border-primary flex-shrink-0">
            <ChatWindow
              sessionId={sessionId}
              messages={chatMessages}
              currentUser={user}
              participants={participants}
              onSendMessage={sendMessage}
              isConnected={isConnected}
            />
          </div>
        )}
      </div>

      {/* Auto-save Indicator */}
      {lastSavedAt && (
        <div className="fixed bottom-4 right-4 bg-success text-white px-3 py-1 rounded-lg text-sm animate-fade-in">
          Auto-saved at {lastSavedAt.toLocaleTimeString()}
        </div>
      )}

      {/* Session Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading text-primary">Session Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="input"
                  placeholder="Enter session name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="input resize-none h-20"
                  placeholder="Describe your session..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Max Participants
                </label>
                <select
                  value={settingsForm.maxParticipants}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxParticipants: parseInt(e.target.value) })}
                  className="input"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.isPublic}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isPublic: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-primary">Make session public</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.allowAnonymous}
                    onChange={(e) => setSettingsForm({ ...settingsForm, allowAnonymous: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-primary">Allow anonymous users</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.executionEnabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, executionEnabled: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-primary">Enable code execution</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            {isCreator && (
              <div className="mt-8 pt-6 border-t border-primary">
                <h4 className="text-sm font-medium text-error mb-4">Danger Zone</h4>
                <button
                  onClick={handleEndSession}
                  className="w-full btn-danger"
                >
                  End Session
                </button>
                <p className="text-xs text-secondary mt-2">
                  This will permanently end the session and remove all participants.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 text-xs text-secondary">
        <div className="bg-tertiary px-3 py-2 rounded-lg">
          <div className="space-y-1">
            <div>Ctrl+Enter: Execute Code</div>
            <div>Ctrl+Shift+P: Toggle Participants</div>
            <div>Ctrl+Shift+C: Toggle Chat</div>
            <div>Ctrl+Shift+E: Toggle Execution</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;