import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosAuthRepository } from '../../infrastructure';
import { PasswordRecoveryUseCase } from '../../application/password-recovery-use-case';
import { ResetPasswordUseCase } from '../../application/reset-password-use-case';
import type { PasswordRecoveryRequest, ResetPasswordRequest, PasswordRecoveryResult } from '../../domain';

export function usePasswordRecovery() {
  const recoveryMutation = useMutation<PasswordRecoveryResult, Error, PasswordRecoveryRequest>({
    mutationFn: (request) => {
      const useCase = new PasswordRecoveryUseCase(new AxiosAuthRepository());
      return useCase.execute(request);
    },
  });

  const resetMutation = useMutation<PasswordRecoveryResult, Error, ResetPasswordRequest>({
    mutationFn: (request) => {
      const useCase = new ResetPasswordUseCase(new AxiosAuthRepository());
      return useCase.execute(request);
    },
  });

  return useMemo(
    () => ({
      requestPasswordReset: recoveryMutation.mutate,
      requestPasswordResetAsync: recoveryMutation.mutateAsync,
      resetPassword: resetMutation.mutate,
      resetPasswordAsync: resetMutation.mutateAsync,
      isRequesting: recoveryMutation.isPending,
      isResetting: resetMutation.isPending,
      requestError: recoveryMutation.error instanceof Error ? recoveryMutation.error.message : null,
      resetError: resetMutation.error instanceof Error ? resetMutation.error.message : null,
      requestResult: recoveryMutation.data,
      resetResult: resetMutation.data,
      resetRequest: recoveryMutation.reset,
      resetReset: resetMutation.reset,
    }),
    [recoveryMutation, resetMutation]
  );
}
