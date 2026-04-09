/**
 * Repositorio Axios para Usuarios
 */

import { Usuario, UsuarioRepository } from '../domain';
import { UsuarioMapper, UsuarioDTO, CrearUsuarioDTO } from './usuario-mapper';
import { apiService } from '../../../core/services';

export class AxiosUsuarioRepository implements UsuarioRepository {
  async create(usuario: Usuario, password?: string): Promise<Usuario> {
    const dtoBackend = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      numeroDocumento: usuario.numeroDocumento,
      idRol: usuario.idRol,
      password: password,
    };
    
    const response = await apiService.post<any>('usuarios/', dtoBackend);
    
    // Extraer el usuario de la estructura {success, data: {...}}
    const usuarioData = response.data.data || response.data;
    return UsuarioMapper.toDomain(usuarioData);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    const dtoBackend = {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      numeroDocumento: usuario.numeroDocumento,
      idRol: usuario.idRol,
      activo: usuario.estado === 'activo',
    };
    
    const response = await apiService.patch<any>(`usuarios/${usuario.id}/`, dtoBackend);
    
    // Extraer el usuario de la estructura {success, data: {...}}
    const usuarioData = response.data.data || response.data;
    return UsuarioMapper.toDomain(usuarioData);
  }

  async cambiarEstado(id: string, nuevoEstado: 'activo' | 'inactivo'): Promise<Usuario> {
    const endpoint = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    const response = await apiService.post<any>(`usuarios/${id}/${endpoint}/`, {});
    const usuarioData = response.data.data || response.data;
    return UsuarioMapper.toDomain(usuarioData);
  }

  async findById(id: string): Promise<Usuario | null> {
    try {
      const response = await apiService.get<any>(`usuarios/${id}/`);
      const usuarioData = response.data.data || response.data;
      return UsuarioMapper.toDomain(usuarioData);
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const response = await apiService.get<{ results: UsuarioDTO[] }>('usuarios/', {
        params: { search: email },
      });
      const results = response.data.results;
      if (results && results.length > 0) {
        return UsuarioMapper.toDomain(results[0]);
      }
      return null;
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
    const response = await apiService.get<{ count: number }>('usuarios/', {
      params: { page: 1, page_size: 1 },
    });
    return response.data.count;
  }

  async findByRol(rol: number): Promise<Usuario[]> {
    const response = await apiService.get<{ results: UsuarioDTO[] }>('usuarios/', {
      params: { id_rol: rol, page_size: 1000 },
    });
    return (response.data.results || []).map(dto => UsuarioMapper.toDomain(dto));
  }
}
