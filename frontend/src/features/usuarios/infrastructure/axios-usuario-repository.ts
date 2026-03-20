/**
 * Repositorio Axios para Usuarios
 */

import { Usuario, UsuarioRepository } from '../domain';
import { UsuarioMapper, UsuarioDTO, CrearUsuarioDTO } from './usuario-mapper';
import { apiService } from '../../../core/services';

export class AxiosUsuarioRepository implements UsuarioRepository {
  async create(usuario: Usuario, password?: string): Promise<Usuario> {
    // Construir DTO para el backend
    const dtoBackend = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
      email: usuario.email,
      correo: usuario.email, // Por si el backend lo espera así
      numero_documento: usuario.numeroDocumento,
      numeroDocumento: usuario.numeroDocumento, // Por si el backend lo espera así
      id_rol: usuario.idRol,
      idRol: usuario.idRol, // Por si el backend lo espera así
      password: password,
      password_hash: password,
      centro_atencion: usuario.centroAtencion,
      centroAtencion: usuario.centroAtencion,
      telefono: usuario.telefono,
    };
    
    console.log('📝 DTO de creación enviado al backend:', dtoBackend);
    const response = await apiService.post<any>('usuarios/', dtoBackend);
    console.log('✅ Respuesta completa del backend:', response.data);
    
    // Extraer el usuario de la estructura {success, data: {...}}
    const usuarioData = response.data.data || response.data;
    console.log('📊 Datos del usuario a mapear:', usuarioData);
    return UsuarioMapper.toDomain(usuarioData);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    // Construir DTO para el backend con ambos formatos
    const dtoBackend = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombre_completo: `${usuario.nombre} ${usuario.apellido}`,
      email: usuario.email,
      correo: usuario.email,
      numero_documento: usuario.numeroDocumento,
      numeroDocumento: usuario.numeroDocumento,
      id_rol: usuario.idRol,
      idRol: usuario.idRol,
      activo: usuario.estado === 'activo',
      estado: usuario.estado,
    };
    
    console.log(`📝 DTO enviado al backend para user ${usuario.id}:`, dtoBackend);
    const response = await apiService.patch<any>(`usuarios/${usuario.id}/`, dtoBackend);
    console.log('✅ Respuesta completa del backend:', response.data);
    
    // Extraer el usuario de la estructura {success, data: {...}}
    const usuarioData = response.data.data || response.data;
    console.log('📊 Datos del usuario a mapear:', usuarioData);
    return UsuarioMapper.toDomain(usuarioData);
  }

  async cambiarEstado(id: string, nuevoEstado: 'activo' | 'inactivo'): Promise<Usuario> {
    const endpoint = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    console.log(`🔄 Llamando /usuarios/${id}/${endpoint}/`);
    const response = await apiService.post<any>(`usuarios/${id}/${endpoint}/`, {});
    console.log(`✅ Estado cambiado:`, response.data);
    const usuarioData = response.data.data || response.data;
    return UsuarioMapper.toDomain(usuarioData);
  }

  async findById(id: string): Promise<Usuario | null> {
    try {
      console.log(`Buscando usuario por ID en repositorio: ${id}`);
      const response = await apiService.get<any>(`usuarios/${id}/`);
      console.log(`Respuesta completa del backend:`, response.data);
      // Extraer el usuario de la estructura {success, data: {...}}
      const usuarioData = response.data.data || response.data;
      console.log(`Datos del usuario a mapear:`, usuarioData);
      return UsuarioMapper.toDomain(usuarioData);
    } catch (error) {
      console.error(`Error buscando usuario con ID ${id}:`, error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const response = await apiService.get<UsuarioDTO>(`usuarios/email/${email}/`);
      return UsuarioMapper.toDomain(response.data);
    } catch (error) {
      return null;
    }
  }

  async findAll(criteria: any): Promise<{ items: Usuario[]; total: number; stats?: Record<string, number> }> {
    const params = {
      page: criteria.page || 1,
      page_size: criteria.pageSize || 10,
      search: criteria.search || '',
      ordering: criteria.ordering || '',
      ...criteria.filters,
    };

    const response = await apiService.get<{ results: UsuarioDTO[]; count: number; stats?: Record<string, number> }>('usuarios/', { params });
    return {
      items: response.data.results.map(dto => UsuarioMapper.toDomain(dto)),
      total: response.data.count,
      stats: response.data.stats,
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiService.delete(`usuarios/${id}/`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await apiService.get<{ count: number }>('usuarios/count/');
    return response.data.count;
  }

  async findByRol(rol: number): Promise<Usuario[]> {
    const response = await apiService.get<UsuarioDTO[]>('usuarios/', {
      params: { id_rol: rol },
    });
    return response.data.map(dto => UsuarioMapper.toDomain(dto));
  }
}
