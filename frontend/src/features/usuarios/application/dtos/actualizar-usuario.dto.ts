/**
 * DTOs para Actualizar Usuario
 */

export interface ActualizarUsuarioDTO {
  id: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  numeroDocumento?: string;
  idRol?: number;
  centroAtencion?: string;
  telefono?: string;
}

export interface ActualizarUsuarioResponseDTO {
  success: boolean;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    numeroDocumento: string;
    idRol: number;
    estado: string;
    updatedAt: string;
  };
  message: string;
}