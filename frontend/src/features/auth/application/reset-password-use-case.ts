import type {
  AuthRepository,
  ResetPasswordRequest,
  PasswordRecoveryResult,
} from '../domain';

export class ResetPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(request: ResetPasswordRequest): Promise<PasswordRecoveryResult> {
    if (!request.token) {
      throw new Error('El token es requerido');
    }

    if (!request.password || request.password.length < 8) {
      throw new Error('La contraseña debe tener mínimo 8 caracteres');
    }

    return this.repository.resetPassword(request);
  }
}
