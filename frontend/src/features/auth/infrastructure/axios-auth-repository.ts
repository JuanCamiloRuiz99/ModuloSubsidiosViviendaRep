/**
 * Infrastructure - Implementación del repositorio de autenticación con Axios
 */

import { apiService } from '../../../core/services';
import type {
  AuthRepository,
  LoginCredentials,
  LoginResult,
  PasswordRecoveryRequest,
  PasswordRecoveryResult,
  ResetPasswordRequest,
} from '../domain';

export class AxiosAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await apiService.post<{
      access_token: string;
      user: {
        id: string;
        nombre: string;
        email: string;
        rol: number;
        rolNombre: string;
        estado: string;
      };
    }>('/usuarios/login/', {
      correo: credentials.correo.toLowerCase().trim(),
      password: credentials.password,
    });

    return {
      accessToken: response.data.access_token,
      user: response.data.user,
    };
  }

  async requestPasswordReset(
    request: PasswordRecoveryRequest
  ): Promise<PasswordRecoveryResult> {
    const response = await apiService.post<PasswordRecoveryResult>(
      '/usuarios/solicitar_recuperacion/',
      {
        correo: request.correo.toLowerCase().trim(),
      }
    );

    return response.data;
  }

  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<PasswordRecoveryResult> {
    const response = await apiService.post<PasswordRecoveryResult>(
      '/usuarios/restablecer_contraseña/',
      {
        token: request.token,
        password: request.password,
      }
    );

    return response.data;
  }
}
