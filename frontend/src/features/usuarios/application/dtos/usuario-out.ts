/**
 * DTOs de salida para Usuarios
 */

import { Usuario } from '../../domain/usuario';

export class UsuarioDTO {
  constructor(
    public id: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public numeroDocumento: string,
    public idRol: number,
    public estado: string,
    public centroAtencion?: string,
    public telefono?: string,
    public ultimoAcceso?: Date,
    public requiereResetContrasena?: boolean,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static fromDomain(usuario: Usuario): UsuarioDTO {
    return new UsuarioDTO(
      usuario.id,
      usuario.nombre,
      usuario.apellido,
      usuario.email,
      usuario.numeroDocumento,
      usuario.idRol,
      usuario.estado,
      usuario.centroAtencion,
      usuario.telefono,
      usuario.ultimoAcceso,
      usuario.requiereResetContrasena,
      usuario.createdAt,
      usuario.updatedAt
    );
  }
}

export class ListaUsuariosDTO {
  constructor(
    public items: UsuarioDTO[],
    public total: number,
    public page: number,
    public pageSize: number,
    public totalPages: number
  ) {}

  static fromData(data: any): ListaUsuariosDTO {
    // Manejar respuesta del backend: puede venir como 'results' o 'data'
    const usuarios = data.results || data.data || data.items || [];
    
    return new ListaUsuariosDTO(
      usuarios.map((item: any) => {
        // Parsear nombre_completo o usar nombre y apellido
        const [nombre, apellido] = this.parsearNombre(
          item.nombre_completo || `${item.nombre || ''} ${item.apellido || ''}`.trim()
        );
        
        return new UsuarioDTO(
          item.id_usuario?.toString() || item.id?.toString() || '',
          nombre,
          apellido,
          item.correo || item.email || '',
          item.numeroDocumento || '',
          item.id_rol || 0,
          item.activo ? 'activo' : 'inactivo', // Mapear booleano a string de EstadoUsuario
          item.centroAtencion,
          item.telefono,
          item.ultimoAcceso ? new Date(item.ultimoAcceso) : undefined,
          item.requiereResetContrasena,
          item.fecha_creacion ? new Date(item.fecha_creacion) : item.createdAt ? new Date(item.createdAt) : undefined,
          item.fecha_modificacion ? new Date(item.fecha_modificacion) : item.updatedAt ? new Date(item.updatedAt) : undefined
        );
      }),
      data.count || data.total || 0,
      data.page || 1,
      data.pageSize || data.page_size || 10,
      data.totalPages || data.total_pages || 0
    );
  }

  private static parsearNombre(nombreCompleto: string): [string, string] {
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 0) return ['', ''];
    if (partes.length === 1) return [partes[0], ''];
    return [partes[0], partes.slice(1).join(' ')];
  }
}

export class EstadisticasUsuariosDTO {
  constructor(
    public total: number,
    public activos: number,
    public inactivos: number,
    public bloqueados: number,
    public administradores: number,
    public funcionarios: number,
    public tecnicosVisitantes: number
  ) {}

  static fromData(data: any): EstadisticasUsuariosDTO {
    return new EstadisticasUsuariosDTO(
      data.total,
      data.activos,
      data.inactivos,
      data.bloqueados,
      data.administradores,
      data.funcionarios,
      data.tecnicosVisitantes
    );
  }
}

// Type aliases for backward compatibility with separate DTO files
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Use-case response types
export type CrearUsuarioResponseDTO = {
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
};

export type ActualizarUsuarioResponseDTO = any;

export type ListarUsuariosFilterDTO = {
  page?: number;
  pageSize?: number;
  rol?: string;
  idRol?: number;
  estado?: string;
  centroAtencion?: string;
  search?: string;
  ordering?: string;
};

export type ListarUsuariosResponseDTO = {
  success: boolean;
  usuarios?: any[];
  items?: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
  stats?: {
    total: number;
    activos: number;
    inactivos: number;
    admins: number;
    funcionarios: number;
    tecnicos: number;
  };
};

export type UsuarioListItemDTO = UsuarioDTO & { rolNombre?: string };
export type CambiarEstadoUsuarioDTO = any;
export type CambiarEstadoUsuarioResponseDTO = any;
export type CambiarRolUsuarioDTO = any;
export type CambiarRolUsuarioResponseDTO = any;
