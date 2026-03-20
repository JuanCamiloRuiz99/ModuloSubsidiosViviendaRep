/**
 * Application - Caso de uso para iniciar sesión
 */

import type { AuthRepository, LoginCredentials, LoginResult } from '../domain';

export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    if (!credentials.correo.trim()) throw new Error('El correo es requerido');
    if (!credentials.password) throw new Error('La contraseña es requerida');
    return this.repository.login(credentials);
  }
}
