import React from 'react';

// Type definitions for Loader props
type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
type LoaderType = 'spinner' | 'pulse' | 'skeleton' | 'button';

interface LoaderProps {
  type?: LoaderType;
  size?: LoaderSize;
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  type = 'spinner', 
  size = 'md', 
  fullScreen = false, 
  text = 'Loading...' 
}) => {
  // Size classes with proper typing
  const sizeClasses: Record<LoaderSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
    : 'flex flex-col items-center justify-center py-4';

  // Render spinner loader
  const renderSpinner = () => (
    <div className={`${containerClasses}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-2 text-gray-700">{text}</p>}
    </div>
  );

  // Render pulse loader
  const renderPulse = () => (
    <div className={`${containerClasses}`}>
      <div className="flex space-x-2">
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-pulse`}></div>
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-pulse delay-75`}></div>
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-pulse delay-150`}></div>
      </div>
      {text && <p className="mt-2 text-gray-700">{text}</p>}
    </div>
  );

  // Render skeleton loader for content placeholders
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  // Button loader for inline use in buttons
  const renderButtonLoader = () => (
    <svg className={`${sizeClasses[size]} text-white animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Return the appropriate loader based on type prop
  switch (type) {
    case 'spinner':
      return renderSpinner();
    case 'pulse':
      return renderPulse();
    case 'skeleton':
      return renderSkeleton();
    case 'button':
      return renderButtonLoader();
    default:
      return renderSpinner();
  }
};

export default Loader; 