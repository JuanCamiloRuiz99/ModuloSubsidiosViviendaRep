/**
 * Caso de Uso: Listar Usuarios
 */

import { Usuario, UsuarioRepository } from '../../domain';
import { ListarUsuariosFilterDTO, ListarUsuariosResponseDTO, UsuarioListItemDTO } from '../dtos';

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(filter: ListarUsuariosFilterDTO): Promise<ListarUsuariosResponseDTO> {
    try {
      // Preparar criterios de búsqueda
      const criteria = {
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        search: filter.search || '',
        ordering: filter.ordering || '-created_at',
        filters: {
          ...(filter.idRol && { id_rol: filter.idRol }),
          ...(filter.estado && { estado: filter.estado }),
        },
      };

      // Obtener usuarios del repositorio
      const result = await this.usuarioRepository.findAll(criteria);

      // Mapear a DTO de respuesta
      const usuarios: UsuarioListItemDTO[] = result.items.map(usuario => {
        const usuarioItem: UsuarioListItemDTO = {
          id: String(usuario.id),
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          numeroDocumento: usuario.numeroDocumento,
          idRol: usuario.idRol,
          rolNombre: this.getRolNombre(usuario.idRol),
          estado: usuario.estado,
          centroAtencion: usuario.centroAtencion,
          telefono: usuario.telefono,
          ultimoAcceso: usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso) : undefined,
          createdAt: usuario.createdAt ? new Date(usuario.createdAt) : undefined,
          updatedAt: usuario.updatedAt ? new Date(usuario.updatedAt) : undefined,
        };
        
        if (usuarioItem.id === '0') {
          console.warn('⚠️ ADVERTENCIA en ListarUsuariosUseCase: Usuario con ID 0:', usuarioItem);
        }
        
        return usuarioItem;
      });

      const totalPages = Math.ceil(result.total / (filter.pageSize || 10));

      return {
        success: true,
        usuarios,
        total: result.total,
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        totalPages,
        stats: result.stats as any,
      };
    } catch (error) {
      throw new Error(`Error al listar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private getRolNombre(idRol: number): string {
    const roles: Record<number, string> = {
      1: 'ADMIN',
      2: 'FUNCIONARIO',
      3: 'TECNICO_VISITANTE',
    };
    return roles[idRol] || 'DESCONOCIDO';
  }
}