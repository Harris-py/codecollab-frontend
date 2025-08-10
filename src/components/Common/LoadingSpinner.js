// src/components/Common/LoadingSpinner.js
import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'default', 
  className,
  color = 'accent',
  text,
  centered = false 
}) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border',
    default: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-2',
  };

  const colors = {
    accent: 'border-secondary border-t-accent',
    white: 'border-gray-300 border-t-white',
    primary: 'border-tertiary border-t-primary',
  };

  const spinner = (
    <div 
      className={clsx(
        'rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
    />
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        {spinner}
        {text && (
          <p className="text-secondary text-sm">{text}</p>
        )}
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {spinner}
        <span className="text-secondary">{text}</span>
      </div>
    );
  }

  return spinner;
};

// Loading skeleton component
export const LoadingSkeleton = ({ 
  className,
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded' 
}) => {
  return (
    <div 
      className={clsx(
        'skeleton animate-pulse bg-tertiary',
        width,
        height,
        rounded,
        className
      )}
    />
  );
};

// Page loading component
export const PageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" centered />
        <h2 className="text-xl font-heading gradient-text mt-6 mb-2">CodeCollab</h2>
        <p className="text-secondary">{message}</p>
      </div>
    </div>
  );
};

// Button loading state
export const ButtonLoading = ({ text = 'Loading...', size = 'sm' }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <LoadingSpinner size={size} color="white" />
      <span>{text}</span>
    </div>
  );
};

// Content loading placeholder
export const ContentLoading = ({ lines = 3, className }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton 
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;