import type {
  AuthRepository,
  PasswordRecoveryRequest,
  PasswordRecoveryResult,
} from '../domain';

export class PasswordRecoveryUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(request: PasswordRecoveryRequest): Promise<PasswordRecoveryResult> {
    if (!request.correo || !request.correo.includes('@')) {
      throw new Error('El correo es requerido y debe ser válido');
    }

    return this.repository.requestPasswordReset(request);
  }
}
