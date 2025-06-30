import React from 'react';
import Loader from './Loader';

// Type definitions for Button props
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Loading...',
  onClick,
  ...rest
}) => {
  // Base button classes
  const baseClasses = 'font-semibold rounded-lg focus:outline-none transition-all';
  
  // Size classes with proper typing
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  // Variant classes with proper typing
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  };
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${(disabled || isLoading) ? disabledClasses : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={isLoading ? undefined : onClick}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader type="button" size={size === 'lg' || size === 'xl' ? 'md' : 'sm'} />
          {loadingText && <span>{loadingText}</span>}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;