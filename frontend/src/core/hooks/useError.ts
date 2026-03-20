/**
 * useError Hook - Manejo centralizado de errores
 */

import { useState, useCallback } from 'react';

export interface ErrorDetails {
  code?: string;
  message: string;
  details?: Record<string, any>;
}

export const useError = () => {
  const [error, setError] = useState<ErrorDetails | null>(null);

  const setErrorMessage = useCallback((message: string) => {
    setError({ message });
  }, []);

  const setErrorDetails = useCallback((errorDetails: ErrorDetails) => {
    setError(errorDetails);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasError = error !== null;

  return {
    error,
    hasError,
    setError: setErrorMessage,
    setErrorDetails,
    clearError,
  };
};
