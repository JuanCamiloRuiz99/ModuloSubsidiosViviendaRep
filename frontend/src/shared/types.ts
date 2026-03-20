/**
 * Tipos e interfaces compartidas del sistema
 * 
 * Tipos reutilizables en toda la arquitectura
 */

// Type aliases comunes
export type ID = string | number;
export type JSON = Record<string, any>;
export type JSONArray = Array<JSON>;

// Tipos para API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interfaces base para la arquitectura
export interface Entity<T extends ID = ID> {
  id: T;
  equals(other: Entity<T>): boolean;
}

export interface ValueObject {
  equals(other: ValueObject): boolean;
  value(): any;
}

export interface UseCase<Input = void, Output = void> {
  execute(input: Input): Promise<Output> | Output;
}

export interface Repository<T extends Entity> {
  save(entity: T): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: ID): Promise<boolean>;
}

// Interfaces para filtrado y paginación
export interface FilterCriteria {
  filters?: Record<string, any>;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interfaces para async state management (similar a Redux)
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export interface AsyncAction<T = any> {
  type: 'LOADING' | 'SUCCESS' | 'ERROR' | 'RESET';
  payload?: T;
  error?: Error;
}

// Helper para crear estado inicial async
export const createInitialAsyncState = <T>(initialData?: T): AsyncState<T> => ({
  data: initialData || null,
  loading: false,
  error: null,
  success: false,
});

// Helper para reducer de async state
export const asyncReducer = <T>(
  state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null, success: false };
    case 'SUCCESS':
      return { ...state, loading: false, data: action.payload as T | null, success: true, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error || null, success: false };
    case 'RESET':
      return createInitialAsyncState();
    default:
      return state;
  }
};

// Tipos para componentes React
export type ComponentProps<T = {}> = T & {
  className?: string;
  style?: React.CSSProperties;
};

// Tipos para formularios
export interface FormFieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Tipos para modales y dialogs
export interface DialogState {
  isOpen: boolean;
  title?: string;
  message?: string;
  data?: any;
}

// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

// Tipos para autenticación
export interface User {
  id: ID;
  email: string;
  nombre: string;
  rol: string;
  estado: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

// Tipos para resultados de operaciones
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

// Helper para crear resultado exitoso
export const createSuccessResult = <T>(data: T, message?: string): OperationResult<T> => ({
  success: true,
  data,
  message,
});

// Helper para crear resultado con error
export const createErrorResult = <T>(error: Error, message?: string): OperationResult<T> => ({
  success: false,
  error,
  message,
});
