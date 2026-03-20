/**
 * DTOs para Crear Usuario
 */

export interface CrearUsuarioDTO {
  nombre: string;
  apellido: string;
  email: string;
  numeroDocumento: string;
  idRol: number;
  centroAtencion?: string;
  telefono?: string;
}

export interface CrearUsuarioResponseDTO {
  success: boolean;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    numeroDocumento: string;
    idRol: number;
    estado: string;
    createdAt: string;
  };
  message: string;
}