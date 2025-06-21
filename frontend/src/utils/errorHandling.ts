// Error handling utilities for API requests
export namespace ApiErrors {
  export const ErrorType = {
    NETWORK: 'NETWORK',
    RATE_LIMIT: 'RATE_LIMIT',
    AUTH: 'AUTH',
    PERMISSION: 'PERMISSION',
    SERVER: 'SERVER',
    VALIDATION: 'VALIDATION',
    UNKNOWN: 'UNKNOWN'
  } as const;

  export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

  export interface Error {
    error: string;
    details?: string;
    retryAfter?: number;
  }

  export interface EnhancedError extends Error {
    type: ErrorType;
    isRetryable: boolean;
    retryCount?: number;
  }
}

export function classifyError(error: unknown, attempt: number = 0): ApiErrors.EnhancedError {
  // Handle API response errors
  if (error && typeof error === 'object' && 'status' in error) {
    const response = error as { status: number; statusText: string };
    const errorData = (error as any).data || {};
    
    const baseError: ApiErrors.EnhancedError = {
      error: errorData.error || response.statusText,
      details: errorData.details,
      type: ApiErrors.ErrorType.UNKNOWN,
      isRetryable: false,
      retryCount: attempt
    };

    switch (response.status) {
      case 429:
        return {
          ...baseError,
          type: ApiErrors.ErrorType.RATE_LIMIT,
          retryAfter: errorData.retryAfter || 60,
          isRetryable: true
        };
      case 401:
        return {
          ...baseError,
          type: ApiErrors.ErrorType.AUTH,
          isRetryable: false
        };
      case 403:
        return {
          ...baseError,
          type: ApiErrors.ErrorType.PERMISSION,
          isRetryable: false
        };
      case 422:
        return {
          ...baseError,
          type: ApiErrors.ErrorType.VALIDATION,
          isRetryable: false
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          ...baseError,
          type: ApiErrors.ErrorType.SERVER,
          isRetryable: true
        };
      default:
        return baseError;
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    const isNetworkError = error.message.toLowerCase().includes('network') || 
                          error.message.toLowerCase().includes('fetch');
    return {
      error: error.message,
      type: isNetworkError ? ApiErrors.ErrorType.NETWORK : ApiErrors.ErrorType.UNKNOWN,
      isRetryable: isNetworkError,
      retryCount: attempt
    };
  }

  // Handle unknown errors
  return {
    error: String(error),
    type: ApiErrors.ErrorType.UNKNOWN,
    isRetryable: false,
    retryCount: attempt
  };
}

export function calculateRetryDelay(error: ApiErrors.EnhancedError, baseDelay: number = 500): number {
  if (error.type === ApiErrors.ErrorType.RATE_LIMIT && error.retryAfter) {
    return error.retryAfter * 1000;
  }
  return baseDelay * Math.pow(2, error.retryCount || 0);
}

export function shouldRetry(error: ApiErrors.EnhancedError, maxRetries: number): boolean {
  return error.isRetryable && (error.retryCount || 0) < maxRetries;
}

export function getErrorMessage(error: ApiErrors.EnhancedError): string {
  switch (error.type) {
    case ApiErrors.ErrorType.NETWORK:
      return 'Network connection error. Please check your internet connection and try again.';
    case ApiErrors.ErrorType.RATE_LIMIT:
      return `Rate limit exceeded. Please wait ${error.retryAfter || 60} seconds before trying again.`;
    case ApiErrors.ErrorType.AUTH:
      return 'Authentication required. Please log in to continue.';
    case ApiErrors.ErrorType.PERMISSION:
      return 'You do not have permission to perform this action.';
    case ApiErrors.ErrorType.SERVER:
      return 'Server error. Please try again later.';
    case ApiErrors.ErrorType.VALIDATION:
      return error.error || 'Invalid input. Please check your data and try again.';
    default:
      return error.error || 'An unexpected error occurred. Please try again.';
  }
} 