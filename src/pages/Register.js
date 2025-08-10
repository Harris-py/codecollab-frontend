// src/pages/Register.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import RegisterForm from '../components/Auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleRegistrationSuccess = (user) => {
    console.log('Registration successful:', user);
    // Navigate to dashboard after successful registration
    navigate('/dashboard', { replace: true });
  };

  // Add some animations on mount
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col relative">
      {/* Auth Header */}
      <header className="border-b border-primary relative z-10">
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

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Already have an account?
              </Link>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-tertiary transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Marketing Content */}
            <div className="space-y-8 animate-slide-in">
              <div>
                <h1 className="text-4xl lg:text-5xl font-heading gradient-text mb-6">
                  Start Your Coding Journey Together
                </h1>
                <p className="text-lg text-secondary mb-8">
                  Join thousands of developers who are already collaborating, learning, and building amazing projects on CodeCollab.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1">Get Started in Seconds</h3>
                    <p className="text-sm text-secondary">No credit card required • Create unlimited sessions • Invite up to 10 collaborators</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1">Perfect for Everyone</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-secondary">
                      <div>
                        <p className="font-medium">Students</p>
                        <p className="text-xs">Study groups, homework help, project collaboration</p>
                      </div>
                      <div>
                        <p className="font-medium">Teams</p>
                        <p className="text-xs">Code reviews, pair programming, team standups</p>
                      </div>
                      <div>
                        <p className="font-medium">Educators</p>
                        <p className="text-xs">Live coding demos, interactive lessons, workshops</p>
                      </div>
                      <div>
                        <p className="font-medium">Developers</p>
                        <p className="text-xs">Open source, mentoring, technical interviews</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🌟</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1">Join the Community</h3>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">5,000+</div>
                        <div className="text-xs text-secondary">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">50K+</div>
                        <div className="text-xs text-secondary">Code Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">1M+</div>
                        <div className="text-xs text-secondary">Lines of Code</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-tertiary rounded-lg p-6 glass">
                <p className="text-sm text-secondary italic mb-4">
                  "CodeCollab transformed how our team does code reviews. The real-time collaboration features are incredible!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Sarah Chen</p>
                    <p className="text-xs text-secondary">Senior Developer at TechCorp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex justify-center lg:justify-end animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-full max-w-md">
                <RegisterForm onSuccess={handleRegistrationSuccess} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Link 
                to="/privacy" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/help" 
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Help Center
              </Link>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-secondary text-xs mb-1">
                Questions?{' '}
                <Link 
                  to="/contact" 
                  className="text-accent hover:text-accent-secondary transition-colors"
                >
                  Contact our team
                </Link>
              </p>
              <p className="text-secondary text-xs">
                © 2024 CodeCollab. Building the future of collaborative coding.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 z-0">
        {/* Animated background shapes */}
        <div className="absolute top-1/4 left-0 w-40 h-40 bg-accent rounded-full blur-3xl animate-pulse-accent" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-accent-secondary rounded-full blur-3xl animate-pulse-accent" style={{ animationDelay: '3s' }} />
        <div className="absolute top-3/4 left-1/4 w-32 h-32 bg-success rounded-full blur-3xl animate-pulse-accent" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse-accent" style={{ animationDelay: '4s' }} />
        
        {/* Floating code snippets */}
        <div className="absolute top-16 right-20 font-code text-accent opacity-20 animate-float-slow">
          const welcome = "Hello, CodeCollab!";
        </div>
        <div className="absolute bottom-20 left-16 font-code text-accent opacity-20 animate-float-slow" style={{ animationDelay: '2s' }}>
          def collaborate(): return "awesome"
        </div>
        <div className="absolute top-1/2 right-10 font-code text-accent opacity-20 animate-float-slow" style={{ animationDelay: '4s' }}>
          #include &lt;future.h&gt;
        </div>
        <div className="absolute top-1/3 left-1/3 font-code text-success opacity-20 animate-float-slow" style={{ animationDelay: '6s' }}>
          console.log("collaboration++");
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        .auth-page {
          overflow-x: hidden;
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-15px) rotate(1deg); 
            opacity: 0.6; 
          }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        @keyframes pulse-accent {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-accent {
          animation: pulse-accent 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;