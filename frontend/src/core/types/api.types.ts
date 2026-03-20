/**
 * Tipos globales - API Response, Errors, etc.
 */

// API Response genérica
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Paginación
export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// Error API
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Usuario (base)
export interface IUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  id_rol: number;
  rol_nombre?: string;
  estado: 'activo' | 'inactivo';
  created_at?: string;
  updated_at?: string;
}

// Rol
export interface IRol {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
}

// Estado de la aplicación
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}
