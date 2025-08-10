// src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import { clsx } from 'clsx';

const LoginForm = ({ onSuccess }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      // Handle specific error cases
      if (result.error.includes('locked')) {
        setErrors({ general: result.error });
      } else if (result.error.includes('credentials')) {
        setErrors({ 
          identifier: 'Invalid email/username or password',
          password: 'Invalid email/username or password'
        });
      } else {
        setErrors({ general: result.error });
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-heading gradient-text mb-2">Welcome Back</h2>
          <p className="text-secondary">Sign in to continue coding together</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Email/Username Field */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-primary mb-2">
              Email or Username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
              className={clsx(
                'input',
                errors.identifier && 'input-error'
              )}
              placeholder="Enter your email or username"
              disabled={loading}
            />
            {errors.identifier && (
              <p className="text-error text-sm mt-1">{errors.identifier}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={clsx(
                  'input pr-10',
                  errors.password && 'input-error'
                )}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-secondary">Remember me</span>
            </label>

            <Link 
              to="/forgot-password" 
              className="text-sm text-accent hover:text-accent-secondary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-secondary">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-accent hover:text-accent-secondary transition-colors font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-tertiary rounded-lg">
          <p className="text-xs text-secondary text-center mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, identifier: 'demo@codecollab.dev', password: 'demo123' }))}
              className="p-2 bg-secondary rounded text-secondary hover:text-primary transition-colors"
              disabled={loading}
            >
              📧 demo@codecollab.dev
            </button>
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, identifier: 'demouser', password: 'demo123' }))}
              className="p-2 bg-secondary rounded text-secondary hover:text-primary transition-colors"
              disabled={loading}
            >
              👤 demouser
            </button>
          </div>
        </div>
      </div>

      {/* Login Tips */}
      <div className="mt-6 text-center">
        <div className="bg-tertiary rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-2">💡 Quick Tips</h3>
          <ul className="text-xs text-secondary space-y-1">
            <li>• You can login with either email or username</li>
            <li>• Check "Remember me" for longer sessions</li>
            <li>• Account gets locked after 5 failed attempts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;