/**
 * Mapper para Usuarios - Convierte entre Domain y DTOs
 */

import { Usuario, RolUsuario, EstadoUsuario } from '../domain';

/**
 * Parsea una fecha ISO desde la API de forma segura.
 * Si el string no tiene indicador de zona horaria (Z o ±HH:MM),
 * lo trata como UTC agregando 'Z' para evitar que el navegador
 * lo interprete como hora local.
 */
const parseApiDate = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined;
  const utcStr = /Z$|[+-]\d{2}:\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z';
  const d = new Date(utcStr);
  return isNaN(d.getTime()) ? undefined : d;
};

export interface UsuarioDTO {
  id_usuario?: number;
  idUsuario?: number;
  id?: number;
  nombre_completo?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  email?: string;
  numeroDocumento?: string;
  numero_documento?: string;
  id_rol: number;
  idRol?: number;
  id_rol_display?: string;
  estado?: EstadoUsuario;
  activo?: boolean;
  centroAtencion?: string;
  telefono?: string;
  ultimoAcceso?: string;
  intentosFallidos?: number;
  requiereResetContrasena?: boolean;
  fecha_creacion?: string;
  created_at?: string;
  fecha_modificacion?: string;
  updated_at?: string;
}

export interface CrearUsuarioDTO {
  nombre?: string;
  apellido?: string;
  nombre_completo?: string;
  email?: string;
  correo?: string;
  numeroDocumento?: string;
  id_rol?: number;
  idRol?: number; // Nombre esperado por el backend
  password?: string;
  password_hash?: string;
  centroAtencion?: string;
  telefono?: string;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  numeroDocumento?: string;
  idRol?: number;
  id_rol?: number;
  centroAtencion?: string;
  telefono?: string;
}

export class UsuarioMapper {
  static toDomain(dto: UsuarioDTO): Usuario {
    // Parsear nombre_completo si es necesario
    const [nombre, apellido] = this.parsearNombreCompleto(
      dto.nombre_completo || `${dto.nombre || ''} ${dto.apellido || ''}`.trim()
    );

    // Mejorar captura de ID - intentar múltiples campos
    const id = dto.id_usuario ?? dto.id ?? dto.idUsuario ?? 0;
    
    const email = dto.correo || dto.email || '';
    
    const numeroDocumento = dto.numeroDocumento || dto.numero_documento || '';
    
    const idRol = dto.idRol || dto.id_rol || 0;
    const estado = this.mapearEstado(dto.activo);

    return new Usuario(
      id.toString(),
      nombre,
      apellido,
      email,
      numeroDocumento,
      idRol,
      estado,
      dto.centroAtencion,
      dto.telefono,
      parseApiDate(dto.ultimoAcceso) ?? parseApiDate(dto.fecha_creacion),
      dto.intentosFallidos,
      dto.requiereResetContrasena,
      parseApiDate(dto.fecha_creacion) ?? parseApiDate(dto.created_at),
      parseApiDate(dto.fecha_modificacion) ?? parseApiDate(dto.updated_at)
    );
  }

  static toPersistence(usuario: Usuario): UsuarioDTO {
    return {
      id_usuario: parseInt(usuario.id),
      nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
      correo: usuario.email,
      numeroDocumento: usuario.numeroDocumento,
      id_rol: usuario.idRol,
      activo: usuario.estado === 'activo',
      centroAtencion: usuario.centroAtencion,
      telefono: usuario.telefono,
      ultimoAcceso: usuario.ultimoAcceso?.toISOString(),
      intentosFallidos: usuario.intentosFallidos,
      requiereResetContrasena: usuario.requiereResetContrasena,
      fecha_creacion: usuario.createdAt?.toISOString(),
      fecha_modificacion: usuario.updatedAt?.toISOString(),
    };
  }

  static toCrearUsuarioDTO(usuario: Usuario, password?: string): CrearUsuarioDTO {
    return {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email, // Backend espera 'email', no 'correo'
      numeroDocumento: usuario.numeroDocumento,
      idRol: usuario.idRol, // Backend espera 'idRol', no 'id_rol'
      password: password, // Incluir contraseña si se proporciona
      centroAtencion: usuario.centroAtencion,
      telefono: usuario.telefono,
    };
  }

  static toActualizarUsuarioDTO(usuario: Usuario): ActualizarUsuarioDTO {
    return {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      numeroDocumento: usuario.numeroDocumento,
      idRol: usuario.idRol,
      centroAtencion: usuario.centroAtencion,
      telefono: usuario.telefono,
    };
  }

  static toActualizarUsuarioDTOForBackend(usuario: Usuario): any {
    // Convertir a snake_case para el backend
    return {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      numeroDocumento: usuario.numeroDocumento,
      numero_documento: usuario.numeroDocumento,
      id_rol: usuario.idRol, // Backend espera id_rol
      idRol: usuario.idRol, // Por si acaso también envior idRol
      centroAtencion: usuario.centroAtencion,
      telefono: usuario.telefono,
    };
  }

  private static parsearNombreCompleto(nombreCompleto: string): [string, string] {
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 0) return ['', ''];
    if (partes.length === 1) return [partes[0], ''];
    return [partes[0], partes.slice(1).join(' ')];
  }

  private static mapearEstado(activo?: boolean): EstadoUsuario {
    if (activo === false) return EstadoUsuario.INACTIVO;
    return EstadoUsuario.ACTIVO;
  }
}
