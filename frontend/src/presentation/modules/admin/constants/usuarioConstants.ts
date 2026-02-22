/**
 * Constantes compartidas para el módulo de Usuarios
 */

export const USUARIO_ROLES = {
  ADMINISTRADOR: "ADMINISTRADOR",
  FUNCIONARIO: "FUNCIONARIO",
  TECNICO: "TECNICO",
} as const;

export const USUARIO_ROLE_LABELS = {
  ADMINISTRADOR: "Administrador",
  FUNCIONARIO: "Funcionario",
  TECNICO: "Técnico",
} as const;

export const USUARIO_ESTADOS = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
} as const;

export const USUARIO_ESTADO_LABELS = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
} as const;

export const USUARIO_ESTADO_COLORS = {
  ACTIVO: {
    badgeColor: "bg-green-100 text-green-800",
    statusDot: "bg-green-400",
  },
  INACTIVO: {
    badgeColor: "bg-gray-100 text-gray-800",
    statusDot: "bg-gray-400",
  },
} as const;

export const ROLES_ARRAY = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "FUNCIONARIO", label: "Funcionario" },
  { value: "TECNICO", label: "Técnico" },
];

export const ESTADOS_ARRAY = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];
