/**
 * Modelo de dominio: Programa
 * Define la estructura de un programa de subsidios de vivienda
 */

export interface Programa {
  nombre: string;
  descripcion: string;
  entidad_responsable: string;
  estado: 'BORRADOR' | 'ACTIVO' | 'INHABILITADO';
}

export const ESTADOS_PROGRAMA = {
  BORRADOR: 'BORRADOR',
  ACTIVO: 'ACTIVO',
  INHABILITADO: 'INHABILITADO',
} as const;

export const ESTADO_LABELS = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  INHABILITADO: 'Inhabilitado',
} as const;

export const ESTADO_COLORS = {
  BORRADOR: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACTIVO: 'bg-green-100 text-green-800 border-green-300',
  INHABILITADO: 'bg-red-100 text-red-800 border-red-300',
} as const;
