/**
 * DTOs para Cambiar Rol de Usuario
 */

export interface CambiarRolUsuarioDTO {
  id: string;
  idRol: number;
}

export interface CambiarRolUsuarioResponseDTO {
  success: boolean;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    idRol: number;
    rolNombre: string;
    updatedAt: string;
  };
  message: string;
}