/**
 * Caso de Uso: Cambiar Estado de Usuario
 */

import { UsuarioRepository } from '../../domain';
import { CambiarEstadoDTO } from '../dtos/usuario-in';

export class CambiarEstadoUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: CambiarEstadoDTO): Promise<any> {
    try {
      // Usar endpoint dedicado /activar/ o /desactivar/
      const nuevoEstado = dto.nuevoEstado as 'activo' | 'inactivo';
      const usuarioActualizado = await this.usuarioRepository.cambiarEstado(dto.id, nuevoEstado);

      // Retornar respuesta
      return {
        success: true,
        usuario: {
          id: parseInt(usuarioActualizado.id),
          nombre: usuarioActualizado.nombre,
          apellido: usuarioActualizado.apellido,
          estado: usuarioActualizado.estado,
          updatedAt: usuarioActualizado.updatedAt?.toISOString() || new Date().toISOString(),
        },
        message: `Usuario ${dto.nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
      };
    } catch (error) {
      console.error(`❌ Error en CambiarEstadoUsuarioUseCase:`, error);
      throw new Error(`Error al cambiar estado de usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}