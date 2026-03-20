/**
 * Servicio de Aplicación para Usuarios
 * Orquesta los casos de uso y maneja la lógica de aplicación.
 * Recibe el repositorio por inyección de dependencias (nunca importa infrastructure).
 */

import { UsuarioRepository } from '../../domain';
import {
  CrearUsuarioUseCase,
  ListarUsuariosUseCase,
  ActualizarUsuarioUseCase,
  CambiarRolUsuarioUseCase,
  CambiarEstadoUsuarioUseCase,
} from '../use-cases';
import {
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
  ListarUsuariosDTO,
  CambiarRolDTO,
  CambiarEstadoDTO,
} from '../dtos/usuario-in';

export class UsuarioApplicationService {
  private readonly repository: UsuarioRepository;
  private readonly crearUsuarioUseCase: CrearUsuarioUseCase;
  private readonly listarUsuariosUseCase: ListarUsuariosUseCase;
  private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase;
  private readonly cambiarRolUsuarioUseCase: CambiarRolUsuarioUseCase;
  private readonly cambiarEstadoUsuarioUseCase: CambiarEstadoUsuarioUseCase;

  constructor(repository: UsuarioRepository) {
    this.repository = repository;
    this.crearUsuarioUseCase = new CrearUsuarioUseCase(this.repository);
    this.listarUsuariosUseCase = new ListarUsuariosUseCase(this.repository);
    this.actualizarUsuarioUseCase = new ActualizarUsuarioUseCase(this.repository);
    this.cambiarRolUsuarioUseCase = new CambiarRolUsuarioUseCase(this.repository);
    this.cambiarEstadoUsuarioUseCase = new CambiarEstadoUsuarioUseCase(this.repository);
  }

  // Crear usuario (short name alias)
  async crear(dto: CrearUsuarioDTO) {
    return await this.crearUsuarioUseCase.execute(dto);
  }

  // Crear usuario (full name)
  async crearUsuario(dto: CrearUsuarioDTO) {
    return await this.crear(dto);
  }

  // Listar usuarios con filtros
  async listarUsuarios(filter: ListarUsuariosDTO) {
    return await this.listarUsuariosUseCase.execute(filter);
  }

  // Obtener usuario por ID
  async obtenerUsuario(id: string) {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  // Actualizar usuario
  async actualizarUsuario(dto: ActualizarUsuarioDTO) {
    return await this.actualizarUsuarioUseCase.execute(dto);
  }

  // Cambiar rol de usuario (short name alias)
  async cambiarRol(dto: CambiarRolDTO) {
    return await this.cambiarRolUsuarioUseCase.execute(dto);
  }

  // Cambiar rol de usuario (full name)
  async cambiarRolUsuario(dto: CambiarRolDTO) {
    return await this.cambiarRol(dto);
  }

  // Cambiar estado de usuario (short name alias)
  async cambiarEstado(dto: CambiarEstadoDTO) {
    return await this.cambiarEstadoUsuarioUseCase.execute(dto);
  }

  // Activar usuario (short name alias)
  async activar(id: string) {
    return await this.cambiarEstadoUsuarioUseCase.execute({
      id,
      nuevoEstado: 'activo',
    });
  }

  // Activar usuario (full name)
  async activarUsuario(id: string) {
    return await this.activar(id);
  }

  // Desactivar usuario (short name alias)
  async desactivar(id: string) {
    return await this.cambiarEstadoUsuarioUseCase.execute({
      id,
      nuevoEstado: 'inactivo',
    });
  }

  // Desactivar usuario (full name)
  async desactivarUsuario(id: string) {
    return await this.desactivar(id);
  }

  // Bloquear usuario
  async bloquear(id: string) {
    return await this.cambiarEstadoUsuarioUseCase.execute({
      id,
      nuevoEstado: 'inactivo',
    });
  }

  // Eliminar usuario
  async eliminarUsuario(id: string) {
    const result = await this.repository.delete(id);
    if (!result) {
      throw new Error('Error al eliminar usuario');
    }
    return { success: true, message: 'Usuario eliminado exitosamente' };
  }

  // Buscar usuario por email
  async buscarPorEmail(email: string) {
    return await this.repository.findByEmail(email);
  }

  // Obtener usuarios por rol
  async obtenerUsuariosPorRol(idRol: number) {
    return await this.repository.findByRol(idRol);
  }

  // Contar usuarios totales
  async contarUsuarios() {
    return await this.repository.count();
  }
}
