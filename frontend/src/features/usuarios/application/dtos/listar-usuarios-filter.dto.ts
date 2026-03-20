/**
 * DTOs para Listar Usuarios
 */

export interface ListarUsuariosFilterDTO {
  page?: number;
  pageSize?: number;
  search?: string;
  idRol?: number;
  estado?: string;
  ordering?: string;
}

export interface UsuarioListItemDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  numeroDocumento: string;
  idRol: number;
  rolNombre: string;
  estado: string;
  centroAtencion?: string;
  telefono?: string;
  ultimoAcceso?: string;
  createdAt: string;
}

export interface ListarUsuariosResponseDTO {
  success: boolean;
  usuarios: UsuarioListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}