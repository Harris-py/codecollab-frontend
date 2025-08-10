// src/components/Auth/RegisterForm.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import { clsx } from 'clsx';

const RegisterForm = ({ onSuccess }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  };

  const getPasswordStrengthInfo = () => {
    const levels = [
      { label: 'Very Weak', color: 'bg-error', textColor: 'text-error' },
      { label: 'Weak', color: 'bg-warning', textColor: 'text-warning' },
      { label: 'Fair', color: 'bg-warning', textColor: 'text-warning' },
      { label: 'Good', color: 'bg-success', textColor: 'text-success' },
      { label: 'Strong', color: 'bg-success', textColor: 'text-success' },
    ];
    
    return levels[passwordStrength] || levels[0];
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username cannot exceed 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation (optional but if provided, validate)
    if (formData.name && formData.name.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const registrationData = {
      username: formData.username.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      name: formData.name.trim() || formData.username.trim(),
      rememberMe: formData.rememberMe,
    };

    const result = await register(registrationData);
    
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      // Handle specific error cases
      if (result.error.includes('username')) {
        setErrors({ username: result.error });
      } else if (result.error.includes('email')) {
        setErrors({ email: result.error });
      } else {
        setErrors({ general: result.error });
      }
    }
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-heading gradient-text mb-2">Join CodeCollab</h2>
          <p className="text-secondary">Create your account to start coding together</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className={clsx(
                'input',
                errors.username && 'input-error'
              )}
              placeholder="Choose a unique username"
              disabled={loading}
              maxLength={20}
            />
            {errors.username && (
              <p className="text-error text-sm mt-1">{errors.username}</p>
            )}
            <p className="text-xs text-secondary mt-1">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={clsx(
                'input',
                errors.email && 'input-error'
              )}
              placeholder="Enter your email address"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
              Full Name (Optional)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={clsx(
                'input',
                errors.name && 'input-error'
              )}
              placeholder="Enter your full name"
              disabled={loading}
              maxLength={50}
            />
            {errors.name && (
              <p className="text-error text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={clsx(
                  'input pr-10',
                  errors.password && 'input-error'
                )}
                placeholder="Create a strong password"
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-tertiary rounded-full h-2">
                    <div 
                      className={clsx(
                        'h-full rounded-full transition-all duration-300',
                        strengthInfo.color
                      )}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <span className={clsx('text-xs', strengthInfo.textColor)}>
                    {strengthInfo.label}
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={clsx(
                  'input pr-10',
                  errors.confirmPassword && 'input-error'
                )}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-accent bg-secondary border-primary rounded focus:ring-accent focus:ring-2"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-secondary">Keep me signed in</span>
          </div>

          {/* Terms and Privacy */}
          <div className="text-xs text-secondary">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-accent hover:text-accent-secondary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-accent hover:text-accent-secondary">
              Privacy Policy
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordStrength < 1}
            className="w-full btn-primary py-3"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-secondary">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-accent hover:text-accent-secondary transition-colors font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Registration Benefits */}
      <div className="mt-6">
        <div className="bg-tertiary rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3">🚀 What you'll get:</h3>
          <ul className="text-xs text-secondary space-y-2">
            <li className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>Create unlimited coding sessions</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>Real-time collaboration with up to 10 people</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>Execute code in 7+ programming languages</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>Session history and code exports</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>Customizable themes and preferences</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;