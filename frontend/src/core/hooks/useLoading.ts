/**
 * useLoading Hook - Manejo centralizado de estados de carga
 */

import { useState, useCallback } from 'react';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const useLoading = (initialState: LoadingState = 'idle') => {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = useCallback(() => setState('loading'), []);
  const setSuccess = useCallback(() => setState('success'), []);
  const setError = useCallback(() => setState('error'), []);
  const setIdle = useCallback(() => setState('idle'), []);
  const reset = useCallback(() => setState(initialState), [initialState]);

  return {
    state,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
    setLoading,
    setSuccess,
    setError,
    setIdle,
    reset,
    setState,
  };
};
