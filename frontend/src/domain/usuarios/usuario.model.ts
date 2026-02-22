/**
 * Modelo de Usuario
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  nombre_completo: string;
  numero_documento: string;
  correo: string;
  rol: "ADMINISTRADOR" | "FUNCIONARIO" | "TECNICO";
  estado: "ACTIVO" | "INACTIVO";
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UsuarioStats {
  total: number;
  activos: number;
  inactivos: number;
  por_rol: {
    ADMINISTRADOR?: number;
    FUNCIONARIO?: number;
    TECNICO?: number;
  };
}
