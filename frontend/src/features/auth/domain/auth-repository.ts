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

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<LoginResult>;
}
