/**
 * Constantes globales
 */

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 10000;

// Rutas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USUARIOS: '/usuarios',
  USUARIOS_CREATE: '/usuarios/crear',
  USUARIOS_EDIT: '/usuarios/:id/editar',
  USUARIOS_DETAIL: '/usuarios/:id',
  PROGRAMAS: '/programas',
  AUDITORIA: '/auditoria',
  NOT_FOUND: '*',
};

// Roles
export const ROLE_NAMES: Record<number, string> = {
  1: 'ADMIN',
  2: 'FUNCIONARIO',
  3: 'TECNICO_VISITANTE',
};

export const ROLE_DESCRIPTIONS: Record<number, string> = {
  1: 'Administrador del sistema',
  2: 'Funcionario de la alcaldía',
  3: 'Técnico visitante',
};

// Estados
export const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

// Paginación
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 25, 50, 100];

// Mensajes
export const MESSAGES = {
  SUCCESS_CREATE: 'Registro creado exitosamente',
  SUCCESS_UPDATE: 'Registro actualizado exitosamente',
  SUCCESS_DELETE: 'Registro eliminado exitosamente',
  ERROR_GENERIC: 'Ha ocurrido un error inesperado',
  ERROR_VALIDATION: 'Validación fallida',
  ERROR_NOT_FOUND: 'Registro no encontrado',
  CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este registro?',
};

// Validación
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MIN_CEDULA_LENGTH: 5,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
};
