/**
 * Caso de Uso: Actualizar Usuario
 */

import { Usuario, UsuarioRepository } from '../../domain';
import { ActualizarUsuarioDTO, ActualizarUsuarioResponseDTO } from '../dtos';

export class ActualizarUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: ActualizarUsuarioDTO): Promise<ActualizarUsuarioResponseDTO> {
    try {
      console.log(`🔍 ActualizarUsuarioUseCase - Buscando usuario con ID: ${dto.id}`);
      
      // Obtener usuario existente
      const usuarioExistente = await this.usuarioRepository.findById(dto.id);
      if (!usuarioExistente) {
        console.error(`❌ Usuario NO encontrado con ID: ${dto.id}`);
        throw new Error(`Usuario con ID ${dto.id} no encontrado`);
      }

      console.log(`✅ Usuario encontrado:`, usuarioExistente);

      // Actualizar propiedades
      if (dto.nombre !== undefined) usuarioExistente.nombre = dto.nombre;
      if (dto.apellido !== undefined) usuarioExistente.apellido = dto.apellido;
      if (dto.email !== undefined) usuarioExistente.email = dto.email;
      if (dto.numeroDocumento !== undefined) usuarioExistente.numeroDocumento = dto.numeroDocumento;
      if (dto.idRol !== undefined) usuarioExistente.cambiarRol(dto.idRol);
      if (dto.centroAtencion !== undefined) usuarioExistente.centroAtencion = dto.centroAtencion;
      if (dto.telefono !== undefined) usuarioExistente.telefono = dto.telefono;

      console.log(`📝 Usuario actualizado en memoria:`, usuarioExistente);

      // Persistir cambios
      const usuarioActualizado = await this.usuarioRepository.update(usuarioExistente);

      console.log(`💾 Usuario persistido en backend:`, usuarioActualizado);

      // Retornar respuesta
      return {
        success: true,
        usuario: {
          id: parseInt(usuarioActualizado.id),
          nombre: usuarioActualizado.nombre,
          apellido: usuarioActualizado.apellido,
          email: usuarioActualizado.email,
          numeroDocumento: usuarioActualizado.numeroDocumento,
          idRol: usuarioActualizado.idRol,
          estado: usuarioActualizado.estado,
          updatedAt: usuarioActualizado.updatedAt?.toISOString() || new Date().toISOString(),
        },
        message: 'Usuario actualizado exitosamente',
      };
    } catch (error) {
      console.error(`❌ Error en ActualizarUsuarioUseCase:`, error);
      throw new Error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}