/**
 * Utilidades reutilizables del sistema
 * 
 * Funciones de utilidad que se pueden usar en cualquier part de la aplicación
 */

/**
 * Genera un UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Genera un código único con prefijo
 */
export const generateUniqueCode = (prefix: string = '', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear() % 100;
  return `${prefix}${year}${randomPart}`;
};

/**
 * Convierte un objeto a diccionario filtrando propiedades privadas
 */
export const toDict = (obj: any): Record<string, any> => {
  if (typeof obj !== 'object' || obj === null) {
    return {};
  }
  
  if (Array.isArray(obj)) {
    return {};
  }
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (!key.startsWith('_') && obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

/**
 * Filtra valores null/undefined de un objeto
 */
export const filterNoneValues = (data: Record<string, any>): Record<string, any> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Fusiona múltiples objetos
 */
export const mergeObjects = (...objects: Record<string, any>[]): Record<string, any> => {
  return objects.reduce((acc, obj) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.assign(acc, obj);
    }
    return acc;
  }, {});
};

/**
 * Pagina un array de items
 */
export const paginateArray = (
  items: any[],
  page: number = 1,
  pageSize: number = 10
): { items: any[]; total: number; page: number; pageSize: number; totalPages: number } => {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  
  const total = items.length;
  const start = (validPage - 1) * validPageSize;
  const end = start + validPageSize;
  
  return {
    items: items.slice(start, end),
    total,
    page: validPage,
    pageSize: validPageSize,
    totalPages: Math.ceil(total / validPageSize),
  };
};

/**
 * Trunca una cadena a una longitud máxima
 */
export const truncateString = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Normaliza una cadena (minúsculas, espacios extras removidos)
 */
export const normalizeString = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Capitaliza la primera letra
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Obtiene un valor anidado usando notación de punto
 */
export const getNestedValue = (obj: any, path: string, defaultValue: any = null): any => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (typeof value === 'object' && value !== null && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

/**
 * Establece un valor anidado usando notación de punto
 */
export const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  if (lastKey) {
    current[lastKey] = value;
  }
  
  return obj;
};

/**
 * Formatea una fecha al formato colombiano
 */
export const formatDateCO = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Formatea una fecha y hora al formato colombiano
 */
export const formatDateTimeCO = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calcula la diferencia entre dos fechas
 */
export const dateDifference = (date1: Date, date2: Date): { days: number; hours: number; minutes: number } => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  
  return { days, hours, minutes };
};

/**
 * Crea un timeout como Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Intenta ejecutar una función con reintentos
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
};

/**
 * Debounce una función
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
};

/**
 * Throttle una función
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= delayMs) {
      fn(...args);
      lastCallTime = now;
    }
  };
};
