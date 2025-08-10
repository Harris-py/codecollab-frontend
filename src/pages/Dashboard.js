// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserSessions, useCreateSession, useJoinSession } from '../hooks/useSession';
import { useSocket } from '../hooks/useSocket';
import LoadingSpinner, { ContentLoading } from '../components/Common/LoadingSpinner';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateProfile, updatePreferences, getUserStats } = useAuth();
  const { connectionStatus } = useSocket();
  const { sessions, publicSessions, loading: sessionsLoading, loadUserSessions } = useUserSessions();
  const { createSession, loading: createLoading, supportedLanguages } = useCreateSession();
  const { joinSession, loading: joinLoading } = useJoinSession();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'sessions');
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'create');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
  });
  const [preferences, setPreferences] = useState({
    preferredLanguage: user?.preferences?.preferredLanguage || 'javascript',
    theme: user?.preferences?.theme || 'dark',
    fontSize: user?.preferences?.fontSize || 14,
    autoSave: user?.preferences?.autoSave ?? true,
    notifications: user?.preferences?.notifications ?? true,
  });

  // Create session form
  const [sessionForm, setSessionForm] = useState({
    name: '',
    description: '',
    language: 'javascript',
    maxParticipants: 5,
    isPublic: false,
    allowAnonymous: false,
    executionEnabled: true,
  });

  // Join session form
  const [joinForm, setJoinForm] = useState({
    sessionCode: '',
  });

  const [errors, setErrors] = useState({});

  // Load user stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const result = await getUserStats();
      if (result.success) {
        setUserStats(result.stats);
      }
    };
    loadStats();
  }, [getUserStats]);

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    
    if (tab) setActiveTab(tab);
    if (action === 'create') setShowCreateModal(true);
  }, [searchParams]);

  // Handle create session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!sessionForm.name.trim()) {
      setErrors({ name: 'Session name is required' });
      return;
    }

    const result = await createSession(sessionForm);
    
    if (result.success) {
      setShowCreateModal(false);
      setSessionForm({
        name: '',
        description: '',
        language: 'javascript',
        maxParticipants: 5,
        isPublic: false,
        allowAnonymous: false,
        executionEnabled: true,
      });
      
      // Navigate to the new session
      navigate(`/session/${result.session._id}`);
    } else {
      setErrors({ general: result.error });
    }
  };

  // Handle join session
  const handleJoinSession = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!joinForm.sessionCode.trim()) {
      setErrors({ sessionCode: 'Session code is required' });
      return;
    }

    const result = await joinSession(joinForm.sessionCode.toUpperCase());
    
    if (result.success) {
      setShowJoinModal(false);
      setJoinForm({ sessionCode: '' });
      navigate(`/session/${result.session._id}`);
    } else {
      setErrors({ sessionCode: result.error });
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileData);
    if (result.success) {
      // Profile updated successfully
    }
  };

  // Handle preferences update
  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    const result = await updatePreferences(preferences);
    if (result.success) {
      // Preferences updated successfully
    }
  };

  const tabs = [
    { id: 'sessions', label: 'My Sessions', icon: '📁' },
    { id: 'public', label: 'Public Sessions', icon: '🌍' },
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: { icon: 'JS', color: 'bg-yellow-500' },
      python: { icon: 'PY', color: 'bg-blue-500' },
      cpp: { icon: 'C++', color: 'bg-blue-600' },
      c: { icon: 'C', color: 'bg-gray-600' },
      java: { icon: 'JV', color: 'bg-red-500' },
      go: { icon: 'GO', color: 'bg-cyan-500' },
      rust: { icon: 'RS', color: 'bg-orange-500' },
    };
    return icons[language] || { icon: 'XX', color: 'bg-gray-500' };
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-success', text: 'Connected', icon: '🟢' };
      case 'connecting':
        return { color: 'bg-warning', text: 'Connecting...', icon: '🟡' };
      case 'disconnected':
        return { color: 'bg-error', text: 'Disconnected', icon: '🔴' };
      default:
        return { color: 'bg-secondary', text: 'Offline', icon: '⚫' };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-heading gradient-text mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-secondary">
                Manage your coding sessions and collaborate with others
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 px-3 py-2 bg-tertiary rounded-lg">
                <span>{connectionInfo.icon}</span>
                <span className="text-xs text-secondary">{connectionInfo.text}</span>
              </div>
              
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary"
              >
                Join Session
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-primary">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={clsx(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-secondary hover:text-primary hover:border-primary'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          
          {/* My Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading text-primary">Your Sessions</h2>
                <button
                  onClick={() => loadUserSessions()}
                  className="btn-ghost btn-sm"
                  disabled={sessionsLoading}
                >
                  {sessionsLoading ? <LoadingSpinner size="xs" /> : '🔄'} Refresh
                </button>
              </div>

              {sessionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card">
                      <ContentLoading lines={4} />
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-primary mb-2">No sessions yet</h3>
                  <p className="text-secondary mb-6">
                    Create your first session to start collaborating with others
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    Create Your First Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((session) => {
                    const langInfo = getLanguageIcon(session.language);
                    return (
                      <div key={session._id} className="card hover:shadow-glow transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-primary truncate pr-2">
                            {session.name}
                          </h3>
                          <span className={clsx(
                            'px-2 py-1 text-xs rounded-full',
                            session.status === 'active' ? 'bg-success text-white' : 'bg-secondary text-secondary'
                          )}>
                            {session.status}
                          </span>
                        </div>
                        
                        {session.description && (
                          <p className="text-secondary text-sm mb-4 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={clsx('w-6 h-6 rounded flex items-center justify-center text-xs text-white font-bold', langInfo.color)}>
                              {langInfo.icon}
                            </div>
                            <span className="text-xs text-secondary capitalize">
                              {session.language}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-secondary">
                              {session.activeParticipantsCount || 0}/{session.settings?.maxParticipants || 5}
                            </span>
                            <span className="text-xs text-secondary">participants</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-secondary mb-4">
                          <span>
                            Created {format(new Date(session.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span className="font-code">
                            {session.sessionCode}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/session/${session._id}`)}
                            className="flex-1 btn-primary btn-sm"
                          >
                            {session.userRole === 'creator' ? 'Open' : 'Join'}
                          </button>
                          {session.userRole === 'creator' && (
                            <button className="btn-secondary btn-sm px-3">
                              ⚙️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Public Sessions Tab */}
          {activeTab === 'public' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading text-primary">Public Sessions</h2>
                <p className="text-secondary text-sm">
                  Join active public sessions and learn from others
                </p>
              </div>

              {publicSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-lg font-medium text-primary mb-2">No public sessions</h3>
                  <p className="text-secondary">
                    Check back later for active public sessions
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicSessions.map((session) => {
                    const langInfo = getLanguageIcon(session.language);
                    return (
                      <div key={session._id} className="card hover:shadow-glow transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-primary truncate pr-2">
                            {session.name}
                          </h3>
                          <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                            Live
                          </span>
                        </div>
                        
                        <p className="text-secondary text-sm mb-4 line-clamp-2">
                          {session.description || 'Join this public session to code and learn together.'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={clsx('w-6 h-6 rounded flex items-center justify-center text-xs text-white font-bold', langInfo.color)}>
                              {langInfo.icon}
                            </div>
                            <span className="text-xs text-secondary capitalize">
                              {session.language}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-secondary">
                              {session.activeParticipantsCount || 0} active
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-secondary mb-4">
                          <span>
                            by {session.creator?.username || 'Anonymous'}
                          </span>
                          <span className="font-code">
                            {session.sessionCode}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/session/${session._id}`)}
                          className="w-full btn-primary btn-sm"
                        >
                          Join Session
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-heading text-primary mb-6">Your Statistics</h2>
              
              {userStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card text-center">
                    <div className="text-3xl mb-2">📁</div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      {userStats.totalSessions}
                    </div>
                    <div className="text-sm text-secondary">Sessions Joined</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      {userStats.totalExecutions}
                    </div>
                    <div className="text-sm text-secondary">Code Executions</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl mb-2">⏱️</div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      {Math.round(userStats.totalTime / 60)}h
                    </div>
                    <div className="text-sm text-secondary">Collaboration Time</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      {format(new Date(userStats.memberSince), 'MMM yyyy')}
                    </div>
                    <div className="text-sm text-secondary">Member Since</div>
                  </div>
                </div>
              ) : (
                <ContentLoading lines={4} />
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-heading text-primary mb-6">Profile Settings</h2>
              
              <div className="max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input"
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="input"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="input resize-none h-24"
                      placeholder="Tell others about yourself..."
                      maxLength={200}
                    />
                    <p className="text-xs text-secondary mt-1">
                      {profileData.bio.length}/200 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      className="input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <button type="submit" className="btn-primary">
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-heading text-primary mb-6">Preferences</h2>
              
              <div className="max-w-2xl">
                <form onSubmit={handleUpdatePreferences} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Preferred Language
                      </label>
                      <select
                        value={preferences.preferredLanguage}
                        onChange={(e) => setPreferences({ ...preferences, preferredLanguage: e.target.value })}
                        className="input"
                      >
                        {supportedLanguages.map((lang) => (
                          <option key={lang.name} value={lang.name}>
                            {lang.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Editor Font Size
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="24"
                        value={preferences.fontSize}
                        onChange={(e) => setPreferences({ ...preferences, fontSize: parseInt(e.target.value) })}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                        className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-primary">Enable auto-save</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                        className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-primary">Enable notifications</span>
                    </label>
                  </div>
                  
                  <button type="submit" className="btn-primary">
                    Save Preferences
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading text-primary">Create New Session</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              {errors.general && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  className={clsx('input', errors.name && 'input-error')}
                  placeholder="Enter session name"
                  disabled={createLoading}
                />
                {errors.name && (
                  <p className="text-error text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  className="input resize-none h-20"
                  placeholder="Describe your session..."
                  disabled={createLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Language
                  </label>
                  <select
                    value={sessionForm.language}
                    onChange={(e) => setSessionForm({ ...sessionForm, language: e.target.value })}
                    className="input"
                    disabled={createLoading}
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.name} value={lang.name}>
                        {lang.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Max Participants
                  </label>
                  <select
                    value={sessionForm.maxParticipants}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxParticipants: parseInt(e.target.value) })}
                    className="input"
                    disabled={createLoading}
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionForm.isPublic}
                    onChange={(e) => setSessionForm({ ...sessionForm, isPublic: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                    disabled={createLoading}
                  />
                  <span className="ml-2 text-sm text-primary">Make session public</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionForm.allowAnonymous}
                    onChange={(e) => setSessionForm({ ...sessionForm, allowAnonymous: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                    disabled={createLoading}
                  />
                  <span className="ml-2 text-sm text-primary">Allow anonymous users</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionForm.executionEnabled}
                    onChange={(e) => setSessionForm({ ...sessionForm, executionEnabled: e.target.checked })}
                    className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                    disabled={createLoading}
                  />
                  <span className="ml-2 text-sm text-primary">Enable code execution</span>
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <LoadingSpinner size="sm" color="white" text="Creating..." />
                  ) : (
                    'Create Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading text-primary">Join Session</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Session Code
                </label>
                <input
                  type="text"
                  value={joinForm.sessionCode}
                  onChange={(e) => setJoinForm({ 
                    sessionCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
                  })}
                  className={clsx(
                    'input text-center font-code text-lg tracking-widest',
                    errors.sessionCode && 'input-error'
                  )}
                  placeholder="ABC123"
                  disabled={joinLoading}
                  maxLength={6}
                />
                {errors.sessionCode && (
                  <p className="text-error text-sm mt-1">{errors.sessionCode}</p>
                )}
                <p className="text-xs text-secondary mt-1">
                  Enter the 6-character session code
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={joinLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={joinLoading || joinForm.sessionCode.length !== 6}
                >
                  {joinLoading ? (
                    <LoadingSpinner size="sm" color="white" text="Joining..." />
                  ) : (
                    'Join Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;