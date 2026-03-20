/**
 * useAuth – Hook para gestión de autenticación
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginAction, logout as logoutAction } from '../../../../app/slices/authSlice';
import { storageService } from '../../../../core/services';
import { LoginUseCase } from '../../application';
import { AxiosAuthRepository } from '../../infrastructure';
import type { LoginCredentials } from '../../domain';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      const useCase = new LoginUseCase(new AxiosAuthRepository());
      return useCase.execute(credentials);
    },
    onSuccess: (result) => {
      storageService.setToken(result.accessToken);
      storageService.setUser(result.user);
      dispatch(loginAction(result.user));

      // Redirigir según rol
      if (result.user.rol === 3) {
        navigate('/mis-visitas', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
  });

  const logout = useCallback(() => {
    storageService.clear();
    dispatch(logoutAction());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const getCurrentUser = useCallback(() => {
    return storageService.getUser();
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!storageService.getToken();
  }, []);

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout,
    getCurrentUser,
    isAuthenticated,
    isLoading: loginMutation.isPending,
    error: loginMutation.error instanceof Error ? loginMutation.error.message : null,
    serverError: (loginMutation.error as any)?.response?.data?.error as string | undefined,
    reset: loginMutation.reset,
  };
}
