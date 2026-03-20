/**
 * Caso de Uso: Crear Usuario
 */

import { Usuario, UsuarioRepository, EstadoUsuario } from '../../domain';
import { CrearUsuarioDTO, CrearUsuarioResponseDTO } from '../dtos';

export class CrearUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: CrearUsuarioDTO): Promise<CrearUsuarioResponseDTO> {
    try {
      // Crear entidad de dominio
      const usuario = new Usuario(
        '', // ID se genera en el backend
        dto.nombre,
        dto.apellido,
        dto.email,
        dto.numeroDocumento,
        dto.idRol,
        EstadoUsuario.ACTIVO, // Estado por defecto
        dto.centroAtencion,
        dto.telefono
      );

      // Persistir en el repositorio pasando la contraseña
      const usuarioCreado = await this.usuarioRepository.create(usuario, dto.contrasena);

      // Retornar respuesta
      return {
        success: true,
        usuario: {
          id: parseInt(usuarioCreado.id),
          nombre: usuarioCreado.nombre,
          apellido: usuarioCreado.apellido,
          email: usuarioCreado.email,
          numeroDocumento: usuarioCreado.numeroDocumento,
          idRol: usuarioCreado.idRol,
          estado: usuarioCreado.estado,
          createdAt: usuarioCreado.createdAt?.toISOString() || new Date().toISOString(),
        },
        message: 'Usuario creado exitosamente',
      };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}