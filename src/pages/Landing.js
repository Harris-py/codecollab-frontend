// src/pages/Landing.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJoinSession, useUserSessions } from '../hooks/useSession';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { clsx } from 'clsx';

const Landing = () => {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { joinSession, loading: joinLoading } = useJoinSession();
  const { publicSessions, loadPublicSessions } = useUserSessions();
  
  const [sessionCode, setSessionCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);

  // Load public sessions on mount
  useEffect(() => {
    loadPublicSessions();
  }, [loadPublicSessions]);

  const handleJoinSession = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!sessionCode.trim()) {
      setJoinError('Please enter a session code');
      return;
    }

    if (sessionCode.length !== 6) {
      setJoinError('Session code must be 6 characters');
      return;
    }

    const result = await joinSession(sessionCode.toUpperCase());
    
    if (result.success) {
      navigate(`/session/${result.session._id}`);
    } else {
      setJoinError(result.error);
    }
  };

  const handleSessionCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setSessionCode(value);
      if (joinError) setJoinError('');
    }
  };

  const features = [
    {
      icon: '⚡',
      title: 'Real-time Collaboration',
      description: 'Code together with live cursors, typing indicators, and instant synchronization'
    },
    {
      icon: '🚀',
      title: 'Multi-language Support',
      description: 'Execute code in JavaScript, Python, C++, Java, Go, Rust, and more'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Discuss ideas and debug together with built-in chat functionality'
    },
    {
      icon: '🎨',
      title: 'Customizable Interface',
      description: 'Dark/light themes, adjustable font sizes, and personalized preferences'
    },
    {
      icon: '📊',
      title: 'Session Management',
      description: 'Create public or private sessions with up to 10 participants'
    },
    {
      icon: '💾',
      title: 'Auto-save & History',
      description: 'Never lose your work with automatic saving and execution history'
    }
  ];

  const languages = [
    { name: 'JavaScript', color: 'bg-yellow-500', icon: 'JS' },
    { name: 'Python', color: 'bg-blue-500', icon: 'PY' },
    { name: 'C++', color: 'bg-blue-600', icon: 'C++' },
    { name: 'Java', color: 'bg-red-500', icon: 'JV' },
    { name: 'Go', color: 'bg-cyan-500', icon: 'GO' },
    { name: 'Rust', color: 'bg-orange-500', icon: 'RS' },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Header for landing page */}
      <header className="border-b border-primary glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="text-xl font-heading gradient-text">CodeCollab</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-tertiary transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <Link 
                to="/login" 
                className="btn-ghost"
              >
                Sign In
              </Link>
              
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-heading gradient-text mb-6">
              Code Together,<br />Build Together
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto">
              Real-time collaborative coding platform for teams, students, and developers. 
              Write, execute, and debug code together from anywhere in the world.
            </p>

            {/* Quick Join Section */}
            <div className="max-w-md mx-auto mb-12">
              <div className="card bg-secondary/50 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-primary mb-4">
                  Join a Session
                </h3>
                
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={sessionCode}
                      onChange={handleSessionCodeChange}
                      placeholder="Enter 6-digit session code"
                      className={clsx(
                        'input text-center font-code text-lg tracking-widest',
                        joinError && 'input-error'
                      )}
                      disabled={joinLoading}
                      maxLength={6}
                    />
                    {joinError && (
                      <p className="text-error text-sm mt-2">{joinError}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={joinLoading || sessionCode.length !== 6}
                    className="w-full btn-primary"
                  >
                    {joinLoading ? (
                      <LoadingSpinner size="sm" color="white" text="Joining..." />
                    ) : (
                      'Join Session'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link 
                    to="/register" 
                    className="text-accent hover:text-accent-secondary text-sm transition-colors"
                  >
                    Don't have an account? Sign up to create sessions
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="btn-primary btn-lg px-8"
              >
                🚀 Start Coding Now
              </Link>
              
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="btn-secondary btn-lg px-8"
              >
                📋 View Features
              </button>
            </div>
          </div>
        </div>

        {/* Floating Code Snippets Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="animate-float-slow absolute top-20 left-10 font-code text-accent">
            console.log("Hello, World!");
          </div>
          <div className="animate-float-slow absolute top-40 right-20 font-code text-accent" style={{ animationDelay: '1s' }}>
            def collaborate(): return True
          </div>
          <div className="animate-float-slow absolute bottom-40 left-20 font-code text-accent" style={{ animationDelay: '2s' }}>
            #include &lt;iostream&gt;
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading text-primary mb-4">
              Execute Code in Multiple Languages
            </h2>
            <p className="text-secondary text-lg">
              Full runtime support with instant execution and output
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {languages.map((lang, index) => (
              <div 
                key={lang.name}
                className="flex flex-col items-center p-4 bg-tertiary rounded-lg hover:shadow-glow transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={clsx(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs mb-2',
                  lang.color
                )}>
                  {lang.icon}
                </div>
                <span className="text-sm font-medium text-primary">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {showFeatures && (
        <section className="py-16 animate-slide-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading text-primary mb-4">
                Everything You Need to Code Together
              </h2>
              <p className="text-secondary text-lg">
                Powerful features designed for seamless collaboration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="card hover:shadow-glow transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-heading text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Public Sessions */}
      {publicSessions.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading text-primary mb-4">
                Join Public Sessions
              </h2>
              <p className="text-secondary text-lg">
                Jump into active coding sessions and learn from others
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicSessions.slice(0, 6).map((session) => (
                <div key={session._id} className="card hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-primary truncate">{session.name}</h3>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <p className="text-secondary text-sm mb-4 line-clamp-2">
                    {session.description || 'Join this coding session to collaborate and learn.'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-xs text-white">
                        {session.language?.slice(0, 2).toUpperCase()}
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
                  
                  <button
                    onClick={() => {
                      setSessionCode(session.sessionCode);
                      handleJoinSession({ preventDefault: () => {} });
                    }}
                    className="w-full mt-4 btn-secondary btn-sm"
                    disabled={joinLoading}
                  >
                    Join {session.sessionCode}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Sign up to see all public sessions
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <span className="text-lg font-heading gradient-text">CodeCollab</span>
            </div>
            
            <p className="text-secondary text-sm mb-6">
              Real-time collaborative coding for teams and learners worldwide
            </p>
            
            <div className="flex justify-center space-x-6 text-sm">
              <Link to="/about" className="text-secondary hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/privacy" className="text-secondary hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-secondary hover:text-primary transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="text-secondary hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-primary">
              <p className="text-secondary text-xs">
                © 2024 CodeCollab. Built for developers, by developers.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations for floating elements */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(2deg); opacity: 0.6; }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;