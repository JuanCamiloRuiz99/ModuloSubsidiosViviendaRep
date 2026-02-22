/**
 * Constantes compartidas para el módulo de Programas
 */

export const PROGRAMA_ESTADOS = {
  BORRADOR: 'BORRADOR',
  ACTIVO: 'ACTIVO',
  INHABILITADO: 'INHABILITADO',
} as const;

export const PROGRAMA_ESTADO_LABELS = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  INHABILITADO: 'Inhabilitado',
} as const;

export const PROGRAMA_ESTADO_COLORS = {
  BORRADOR: {
    borderColor: 'border-yellow-400',
    statusBgColor: 'bg-yellow-100',
    statusColor: 'text-yellow-700',
    statusDot: 'bg-yellow-400',
  },
  ACTIVO: {
    borderColor: 'border-green-400',
    statusBgColor: 'bg-green-100',
    statusColor: 'text-green-700',
    statusDot: 'bg-green-400',
  },
  INHABILITADO: {
    borderColor: 'border-red-400',
    statusBgColor: 'bg-red-100',
    statusColor: 'text-red-700',
    statusDot: 'bg-red-400',
  },
} as const;

export const RESPONSABLE_ENTITIES = [
  { value: 'secretaria_general', label: 'Secretaría General' },
  { value: 'alcaldia_popayan', label: 'Alcaldía de Popayán' },
  { value: 'secretaria_desarrollo_social', label: 'Secretaría de Desarrollo Social' },
  { value: 'secretaria_hacienda', label: 'Secretaría de Hacienda' },
  { value: 'secretaria_infraestructura', label: 'Secretaría de Infraestructura' },
];
