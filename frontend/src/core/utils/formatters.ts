/**
 * Formateadores - Funciones para formatear datos
 */

// Formatear fecha
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  return `${day}/${month}/${year}`;
};

// Formatear hora
export const formatTime = (date: string | Date, format: string = 'HH:mm'): string => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (format === 'HH:mm:ss') return `${hours}:${minutes}:${seconds}`;
  return `${hours}:${minutes}`;
};

// Formatear moneda
export const formatCurrency = (value: number, currency: string = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
  }).format(value);
};

// Formatear número con separadores
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convertir a mayúsculas
export const toUpperCase = (str: string): string => {
  return str.toUpperCase();
};

// Convertir a minúsculas
export const toLowerCase = (str: string): string => {
  return str.toLowerCase();
};

// Truncar texto
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};
