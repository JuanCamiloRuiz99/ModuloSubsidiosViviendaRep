export const Role = {
  ADMIN: "ADMIN",
  FUNCIONARIO: "FUNCIONARIO",
  VISITANTE: "VISITANTE",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
