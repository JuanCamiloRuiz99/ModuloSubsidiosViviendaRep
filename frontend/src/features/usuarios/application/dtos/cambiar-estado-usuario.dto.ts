/**
 * DTOs para Activar/Desactivar Usuario
 */

export interface CambiarEstadoUsuarioDTO {
  id: string;
  estado: 'activo' | 'inactivo';
}

export interface CambiarEstadoUsuarioResponseDTO {
  success: boolean;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    estado: string;
    updatedAt: string;
  };
  message: string;
}