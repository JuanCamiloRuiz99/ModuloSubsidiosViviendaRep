/**
 * Validadores reutilizables del sistema
 * 
 * Funciones de validación que se pueden usar en domain y application layers
 */

export class ValidatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidatorError';
  }
}

// Validaciones de strings
export const validateNotEmpty = (value: string, fieldName: string): void => {
  if (!value || value.trim() === '') {
    throw new ValidatorError(`${fieldName} no puede estar vacío`);
  }
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): void => {
  if (value.length < minLength) {
    throw new ValidatorError(
      `${fieldName} debe tener al menos ${minLength} caracteres`
    );
  }
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): void => {
  if (value.length > maxLength) {
    throw new ValidatorError(
      `${fieldName} no puede tener más de ${maxLength} caracteres`
    );
  }
};

export const validateLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): void => {
  validateMinLength(value, minLength, fieldName);
  validateMaxLength(value, maxLength, fieldName);
};

// Validaciones de email
export const validateEmail = (email: string): void => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) {
    throw new ValidatorError(`Correo electrónico inválido: ${email}`);
  }
};

// Validaciones de teléfono
export const validatePhone = (phone: string): void => {
  const cleaned = phone.replace(/\s|-/g, '');
  const pattern = /^(\+57|57)?[1-9]\d{9}$/;
  if (!pattern.test(cleaned)) {
    throw new ValidatorError(`Teléfono inválido: ${phone}`);
  }
};

// Validaciones de cédula colombiana
export const validateCedula = (cedula: string): void => {
  if (!cedula || !cedula.match(/^\d{7,10}$/)) {
    throw new ValidatorError(`Cédula inválida: ${cedula}`);
  }
};

// Validaciones de opciones
export const validateChoice = (
  value: any,
  choices: any[],
  fieldName: string
): void => {
  if (!choices.includes(value)) {
    throw new ValidatorError(
      `${fieldName} debe ser uno de: ${choices.join(', ')}`
    );
  }
};

// Validaciones de números
export const validatePositiveNumber = (
  value: number,
  fieldName: string
): void => {
  if (value <= 0) {
    throw new ValidatorError(`${fieldName} debe ser un número positivo`);
  }
};

export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (value < min || value > max) {
    throw new ValidatorError(
      `${fieldName} debe estar entre ${min} y ${max}`
    );
  }
};

// Validaciones de URL
export const validateUrl = (url: string): void => {
  try {
    new URL(url);
  } catch {
    throw new ValidatorError(`URL inválido: ${url}`);
  }
};

// Validaciones con regex personalizado
export const validateRegex = (
  value: string,
  pattern: RegExp,
  fieldName: string
): void => {
  if (!pattern.test(value)) {
    throw new ValidatorError(
      `${fieldName} no cumple con el formato requerido`
    );
  }
};

// Validaciones opcionales
export const validateOptional = (
  value: any,
  validator: (val: any) => void
): void => {
  if (value !== null && value !== undefined && value !== '') {
    validator(value);
  }
};

// Validar que un objeto tenga propiedades requeridas
export const validateRequiredFields = (
  obj: any,
  fields: string[]
): void => {
  const missing = fields.filter(
    (field) => !obj[field] || obj[field].toString().trim() === ''
  );
  
  if (missing.length > 0) {
    throw new ValidatorError(
      `Campos requeridos faltantes: ${missing.join(', ')}`
    );
  }
};
