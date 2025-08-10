// src/components/Session/ParticipantsList.js
import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';

const ParticipantsList = ({
  participants = [],
  currentUser,
  isCreator = false,
  session,
  cursors = new Map(),
  typingUsers = new Set(),
  onKickUser,
  onPromoteUser,
  onInviteUsers,
  className
}) => {
  const { theme } = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showUserActions, setShowUserActions] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, creators, editors

  // Process participants with additional data
  const processedParticipants = useMemo(() => {
    return participants.map(participant => {
      const isCurrentUser = participant.user?._id === currentUser?.id || participant.user?.id === currentUser?.id;
      const userCursor = cursors.get(participant.socketId || participant.user?._id);
      const isTyping = typingUsers.has(participant.username);
      const lastActivity = participant.lastActivity ? new Date(participant.lastActivity) : null;
      
      return {
        ...participant,
        isCurrentUser,
        cursor: userCursor,
        isTyping,
        lastActivity,
        status: getParticipantStatus(participant, isTyping, lastActivity),
        displayName: participant.username || participant.user?.username || 'Anonymous',
        avatar: getParticipantAvatar(participant),
        color: participant.color || getParticipantColor(participant.username || participant.user?.username),
      };
    });
  }, [participants, currentUser, cursors, typingUsers]);

  // Filter participants based on current filter
  const filteredParticipants = useMemo(() => {
    switch (filter) {
      case 'active':
        return processedParticipants.filter(p => p.status === 'online' || p.isTyping);
      case 'creators':
        return processedParticipants.filter(p => p.role === 'creator');
      case 'editors':
        return processedParticipants.filter(p => p.role === 'editor' || p.role === 'creator');
      default:
        return processedParticipants;
    }
  }, [processedParticipants, filter]);

  // Get participant status
  function getParticipantStatus(participant, isTyping, lastActivity) {
    if (isTyping) return 'typing';
    if (!participant.isActive) return 'offline';
    
    if (lastActivity) {
      const minutesAgo = (Date.now() - lastActivity.getTime()) / (1000 * 60);
      if (minutesAgo > 5) return 'away';
    }
    
    return 'online';
  }

  // Get participant avatar
  function getParticipantAvatar(participant) {
    const name = participant.username || participant.user?.username || 'Anonymous';
    return name.charAt(0).toUpperCase();
  }

  // Get participant color
  function getParticipantColor(username) {
    if (!username) return '#667eea';
    
    const colors = [
      '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Handle user actions
  const handleKickUser = useCallback((participant) => {
    if (!isCreator || participant.isCurrentUser) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to remove ${participant.displayName} from the session?`
    );
    
    if (confirmed) {
      onKickUser?.(participant.user?._id || participant.user?.id);
    }
    
    setShowUserActions(null);
  }, [isCreator, onKickUser]);

  const handlePromoteUser = useCallback((participant) => {
    if (!isCreator || participant.isCurrentUser) return;
    
    const newRole = participant.role === 'editor' ? 'viewer' : 'editor';
    onPromoteUser?.(participant.user?._id || participant.user?.id, newRole);
    setShowUserActions(null);
  }, [isCreator, onPromoteUser]);

  // Handle invite users
  const handleInviteUser = useCallback(() => {
    if (!inviteEmail.trim()) return;
    
    onInviteUsers?.([inviteEmail.trim()]);
    setInviteEmail('');
    setShowInviteModal(false);
  }, [inviteEmail, onInviteUsers]);

  // Copy session code
  const handleCopySessionCode = useCallback(() => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode);
      // You could show a toast here
    }
  }, [session?.sessionCode]);

  // Get status info
  const getStatusInfo = useCallback((status) => {
    switch (status) {
      case 'online':
        return { color: 'bg-success', icon: '🟢', text: 'Online' };
      case 'typing':
        return { color: 'bg-accent', icon: '✏️', text: 'Typing...' };
      case 'away':
        return { color: 'bg-warning', icon: '🟡', text: 'Away' };
      case 'offline':
        return { color: 'bg-secondary', icon: '⚫', text: 'Offline' };
      default:
        return { color: 'bg-secondary', icon: '❓', text: 'Unknown' };
    }
  }, []);

  // Get role info
  const getRoleInfo = useCallback((role) => {
    switch (role) {
      case 'creator':
        return { icon: '👑', text: 'Creator', color: 'text-warning' };
      case 'editor':
        return { icon: '✏️', text: 'Editor', color: 'text-success' };
      case 'viewer':
        return { icon: '👁️', text: 'Viewer', color: 'text-secondary' };
      default:
        return { icon: '👤', text: 'Member', color: 'text-secondary' };
    }
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: '👥' },
    { id: 'active', label: 'Active', icon: '🟢' },
    { id: 'editors', label: 'Editors', icon: '✏️' },
    { id: 'creators', label: 'Admins', icon: '👑' },
  ];

  return (
    <div className={clsx('flex flex-col h-full bg-sidebar border-r border-primary', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-secondary border-b border-primary">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-primary">Participants</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary">
              {processedParticipants.length}/{session?.settings?.maxParticipants || 10}
            </span>
            
            {isCreator && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-ghost btn-sm"
                title="Invite Users"
              >
                ➕
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-tertiary rounded p-1">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={clsx(
                'flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors flex-1 justify-center',
                filter === filterOption.id
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary'
              )}
            >
              <span>{filterOption.icon}</span>
              <span className="hidden sm:inline">{filterOption.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredParticipants.length === 0 ? (
          <div className="text-center text-secondary py-8">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-sm">
              {filter === 'all' ? 'No participants' : `No ${filter} participants`}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredParticipants.map((participant) => {
              const statusInfo = getStatusInfo(participant.status);
              const roleInfo = getRoleInfo(participant.role);
              
              return (
                <div
                  key={participant.socketId || participant.user?._id || participant.user?.id}
                  className={clsx(
                    'relative group p-3 rounded-lg transition-all duration-200 hover:bg-tertiary',
                    participant.isCurrentUser && 'bg-accent/10 border border-accent/20'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: participant.color }}
                      >
                        {participant.avatar}
                      </div>
                      
                      {/* Status Indicator */}
                      <div
                        className={clsx(
                          'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-sidebar flex items-center justify-center text-xs',
                          statusInfo.color
                        )}
                      >
                        {participant.status === 'typing' && (
                          <div className="typing-indicator scale-50">
                            <div className="typing-dots">
                              <div className="typing-dot bg-white"></div>
                              <div className="typing-dot bg-white"></div>
                              <div className="typing-dot bg-white"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={clsx(
                          'font-medium truncate',
                          participant.isCurrentUser ? 'text-accent' : 'text-primary'
                        )}>
                          {participant.displayName}
                          {participant.isCurrentUser && (
                            <span className="text-xs text-accent ml-1">(You)</span>
                          )}
                        </span>
                        
                        {/* Role Badge */}
                        <div className={clsx('flex items-center space-x-1', roleInfo.color)}>
                          <span className="text-xs">{roleInfo.icon}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={clsx('text-xs', statusInfo.color.replace('bg-', 'text-'))}>
                          {statusInfo.text}
                        </span>
                        
                        {participant.lastActivity && participant.status !== 'typing' && (
                          <>
                            <span className="text-secondary">•</span>
                            <span className="text-secondary">
                              {formatDistanceToNow(participant.lastActivity, { addSuffix: true })}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Cursor Position */}
                      {participant.cursor && (
                        <div className="text-xs text-secondary mt-1">
                          📍 Line {participant.cursor.position?.line || 0}, Col {participant.cursor.position?.column || 0}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!participant.isCurrentUser && isCreator && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setShowUserActions(
                            showUserActions === participant.user?._id ? null : participant.user?._id
                          )}
                          className="btn-ghost btn-sm p-1"
                        >
                          ⋮
                        </button>
                        
                        {/* User Actions Menu */}
                        {showUserActions === participant.user?._id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-secondary border border-primary rounded-lg shadow-lg z-10 animate-slide-in">
                            <div className="py-1">
                              <button
                                onClick={() => handlePromoteUser(participant)}
                                className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-tertiary transition-colors"
                              >
                                {participant.role === 'editor' ? '👁️ Make Viewer' : '✏️ Make Editor'}
                              </button>
                              
                              <button
                                onClick={() => {
                                  // Copy user info or send direct message
                                  navigator.clipboard.writeText(`@${participant.displayName}`);
                                  setShowUserActions(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-tertiary transition-colors"
                              >
                                💬 Mention User
                              </button>
                              
                              <div className="border-t border-primary my-1"></div>
                              
                              <button
                                onClick={() => handleKickUser(participant)}
                                className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-tertiary transition-colors"
                              >
                                🚪 Remove from Session
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="border-t border-primary p-4 bg-tertiary/50">
        <div className="space-y-3">
          {/* Session Code */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Session Code:</span>
            <button
              onClick={handleCopySessionCode}
              className="flex items-center space-x-2 text-sm font-code text-accent hover:text-accent-secondary transition-colors"
              title="Click to copy"
            >
              <span>{session?.sessionCode}</span>
              <span className="text-xs">📋</span>
            </button>
          </div>
          
          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="font-medium text-primary">
                {processedParticipants.filter(p => p.status === 'online' || p.status === 'typing').length}
              </div>
              <div className="text-secondary">Active</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-primary">
                {processedParticipants.filter(p => p.status === 'typing').length}
              </div>
              <div className="text-secondary">Typing</div>
            </div>
          </div>
          
          {/* Language Info */}
          <div className="text-center">
            <div className="text-xs text-secondary mb-1">Language</div>
            <div className="text-sm font-medium text-primary capitalize">
              {session?.language || 'JavaScript'}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading text-primary">Invite Participants</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input"
                  placeholder="Enter email address"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInviteUser();
                    }
                  }}
                />
              </div>
              
              <div className="text-sm text-secondary">
                <p className="mb-2">Or share the session code:</p>
                <div className="flex items-center space-x-2 p-2 bg-tertiary rounded">
                  <code className="flex-1 font-code">{session?.sessionCode}</code>
                  <button
                    onClick={handleCopySessionCode}
                    className="btn-ghost btn-sm"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                  className="flex-1 btn-primary"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user actions */}
      {showUserActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowUserActions(null)}
        />
      )}
    </div>
  );
};

export default ParticipantsList;