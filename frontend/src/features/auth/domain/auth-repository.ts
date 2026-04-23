/**
 * Domain - Interfaz del repositorio de autenticación
 */

export interface LoginCredentials {
  correo: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: number;
    rolNombre: string;
    estado: string;
  };
}

export interface PasswordRecoveryRequest {
  correo: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface PasswordRecoveryResult {
  success: boolean;
  message: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  requestPasswordReset(request: PasswordRecoveryRequest): Promise<PasswordRecoveryResult>;
  resetPassword(request: ResetPasswordRequest): Promise<PasswordRecoveryResult>;
}
