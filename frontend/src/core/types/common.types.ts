/**
 * Tipos comunes - Constants para roles y estados
 */

// Constants para roles (usando as const para validación de tipos)
export const RolEnum = {
  ADMIN: 1,
  FUNCIONARIO: 2,
  TECNICO_VISITANTE: 3,
} as const;

export type RolEnumType = typeof RolEnum[keyof typeof RolEnum];

// Constants para estados
export const EstadoEnum = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
} as const;

export type EstadoEnumType = typeof EstadoEnum[keyof typeof EstadoEnum];

// Formularios
export interface FormError {
  field: string;
  message: string;
}

// Paginación UI
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  filters?: Record<string, any>;
}

// Modal
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'view';
  data?: any;
}

// Notificación
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
