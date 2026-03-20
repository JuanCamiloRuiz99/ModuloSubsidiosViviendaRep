/**
 * Validators - Validadores reutilizables
 */

export const emailValidator = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string): void => {
  if (!emailValidator(email)) {
    throw new Error('Invalid email format');
  }
};

export const cedulaValidator = (cedula: string): boolean => {
  return !!(cedula && cedula.length >= 5 && cedula.length <= 15);
};

export const phoneValidator = (phone: string): boolean => {
  return !!(phone && phone.length >= 8);
};

export const lengthValidator = (value: string, min: number, max: number): boolean => {
  return !!(value && value.length >= min && value.length <= max);
};

export const validateNotEmpty = (value: string, field: string): void => {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
};

export const validateLength = (value: string, min: number, max: number, field: string): void => {
  if (value.length < min || value.length > max) {
    throw new Error(`${field} must be between ${min} and ${max} characters`);
  }
};
