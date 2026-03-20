/**
 * Validadores - Funciones de validación comunes
 */

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar cédula colombiana
export const validateCedula = (cedula: string): boolean => {
  const cedulaRegex = /^\d{5,10}$/;
  return cedulaRegex.test(cedula);
};

// Validar teléfono
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

// Validar campo vacío
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Validar longitud mínima
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

// Validar longitud máxima
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Validar rango de números
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
