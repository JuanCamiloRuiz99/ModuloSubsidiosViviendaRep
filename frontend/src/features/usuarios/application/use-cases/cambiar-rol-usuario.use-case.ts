/**
 * Caso de Uso: Cambiar Rol de Usuario
 */

import { UsuarioRepository, RolUsuario } from '../../domain';
import { CambiarRolDTO } from '../dtos/usuario-in';

export class CambiarRolUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: CambiarRolDTO): Promise<any> {
    try {
      // Obtener usuario existente
      const usuario = await this.usuarioRepository.findById(dto.id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Cambiar rol usando método de dominio
      usuario.cambiarRol(Number(dto.nuevoRol));

      // Persistir cambios
      const usuarioActualizado = await this.usuarioRepository.update(usuario);

      // Retornar respuesta
      return {
        success: true,
        usuario: {
          id: parseInt(usuarioActualizado.id),
          nombre: usuarioActualizado.nombre,
          apellido: usuarioActualizado.apellido,
          email: usuarioActualizado.email,
          idRol: usuarioActualizado.idRol,
          rolNombre: this.getRolNombre(usuarioActualizado.idRol),
          updatedAt: usuarioActualizado.updatedAt?.toISOString() || new Date().toISOString(),
        },
        message: 'Rol de usuario actualizado exitosamente',
      };
    } catch (error) {
      throw new Error(`Error al cambiar rol de usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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