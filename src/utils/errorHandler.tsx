// Error types for better error categorization
export enum ErrorType {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN = 'UNKNOWN'
}

export interface AppError {
    type: ErrorType;
    message: string;
    code?: string | number;
    details?: any;
    timestamp: Date;
}

export class ErrorHandler {
    // Convert API errors to user-friendly messages
    static parseApiError(error: any): AppError {
        const timestamp = new Date();
        
        // Handle axios errors
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
                case 400:
                    return {
                        type: ErrorType.VALIDATION,
                        message: data?.message || 'Invalid request. Please check your input.',
                        code: status,
                        details: data?.errors || data?.details,
                        timestamp
                    };
                    
                case 401:
                    return {
                        type: ErrorType.AUTHENTICATION,
                        message: 'Please log in to continue.',
                        code: status,
                        timestamp
                    };
                    
                case 403:
                    return {
                        type: ErrorType.AUTHORIZATION,
                        message: 'You do not have permission to perform this action.',
                        code: status,
                        timestamp
                    };
                    
                case 404:
                    return {
                        type: ErrorType.VALIDATION,
                        message: data?.message || 'The requested resource was not found.',
                        code: status,
                        timestamp
                    };
                    
                case 408:
                case 504:
                    return {
                        type: ErrorType.TIMEOUT,
                        message: 'Request timed out. Please try again.',
                        code: status,
                        timestamp
                    };
                    
                case 429:
                    return {
                        type: ErrorType.VALIDATION,
                        message: 'Too many requests. Please wait a moment before trying again.',
                        code: status,
                        timestamp
                    };
                    
                case 500:
                case 502:
                case 503:
                    return {
                        type: ErrorType.SERVER_ERROR,
                        message: 'Server error. Please try again later.',
                        code: status,
                        timestamp
                    };
                    
                default:
                    return {
                        type: ErrorType.SERVER_ERROR,
                        message: data?.message || 'An unexpected error occurred.',
                        code: status,
                        details: data,
                        timestamp
                    };
            }
        }
        
        // Handle network errors
        if (error.request) {
            return {
                type: ErrorType.NETWORK,
                message: 'Network error. Please check your internet connection.',
                details: error.message,
                timestamp
            };
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            return {
                type: ErrorType.TIMEOUT,
                message: 'Request timed out. Please try again.',
                timestamp
            };
        }
        
        // Handle session expired
        if (error.message?.includes('session') && error.message?.includes('expired')) {
            return {
                type: ErrorType.SESSION_EXPIRED,
                message: 'Your session has expired. Please start a new test.',
                timestamp
            };
        }
        
        // Default error
        return {
            type: ErrorType.UNKNOWN,
            message: error.message || 'An unexpected error occurred.',
            details: error,
            timestamp
        };
    }
    
    // Get user-friendly error message for display
    static getUserMessage(error: AppError): string {
        return error.message;
    }
    
    // Log error for debugging (in development) or send to monitoring service (in production)
    static logError(error: AppError, context?: string): void {
        const errorLog = {
            ...error,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Error logged:', errorLog);
        } else {
            // In production, send to monitoring service like Sentry
            // sentryCapture(errorLog);
        }
    }
    
    // Handle errors in React components
    static handleComponentError(error: any, context: string = 'Component'): AppError {
        const appError = this.parseApiError(error);
        this.logError(appError, context);
        return appError;
    }
}

// React Error Boundary component
import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: AppError;
}

export class AppErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        const appError = ErrorHandler.parseApiError(error);
        ErrorHandler.logError(appError, 'ErrorBoundary');
        
        return {
            hasError: true,
            error: appError
        };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        ErrorHandler.logError(
            ErrorHandler.parseApiError(error),
            `ErrorBoundary - ${errorInfo.componentStack}`
        );
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Something went wrong
                                </h3>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                {this.state.error?.message || 'An unexpected error occurred. Please refresh the page and try again.'}
                            </p>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Go Home
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error?.details && (
                            <details className="mt-4">
                                <summary className="text-sm text-gray-500 cursor-pointer">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                                    {JSON.stringify(this.state.error.details, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// Custom hook for error handling in components
export const useErrorHandler = () => {
    const [error, setError] = React.useState<AppError | null>(null);
    
    const handleError = React.useCallback((error: any, context?: string) => {
        const appError = ErrorHandler.handleComponentError(error, context);
        setError(appError);
    }, []);
    
    const clearError = React.useCallback(() => {
        setError(null);
    }, []);
    
    return {
        error,
        handleError,
        clearError,
        hasError: !!error
    };
};

// Error toast notification component
export const ErrorToast: React.FC<{
    error: AppError;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}> = ({ error, onClose, autoClose = true, duration = 5000 }) => {
    React.useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);
    
    const getIconColor = () => {
        switch (error.type) {
            case ErrorType.VALIDATION:
                return 'text-yellow-400';
            case ErrorType.NETWORK:
            case ErrorType.TIMEOUT:
                return 'text-blue-400';
            default:
                return 'text-red-400';
        }
    };
    
    return (
        <div className="fixed top-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className={`h-6 w-6 ${getIconColor()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                            {error.type === ErrorType.VALIDATION ? 'Validation Error' : 
                             error.type === ErrorType.NETWORK ? 'Network Error' :
                             error.type === ErrorType.TIMEOUT ? 'Timeout Error' : 'Error'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {error.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorHandler; 