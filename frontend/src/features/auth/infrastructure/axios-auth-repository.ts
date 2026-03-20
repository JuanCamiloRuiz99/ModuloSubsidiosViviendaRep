/**
 * Infrastructure - Implementación del repositorio de autenticación con Axios
 */

import { apiService } from '../../../core/services';
import type { AuthRepository, LoginCredentials, LoginResult } from '../domain';

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
}
