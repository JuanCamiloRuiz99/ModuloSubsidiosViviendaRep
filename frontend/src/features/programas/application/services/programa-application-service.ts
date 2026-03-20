/**
 * Servicio de Aplicación para Programas
 * 
 * Orquesta los use cases y proporciona una interfaz unificada
 * para la capa de presentación
 */

import type { ProgramaRepository } from '../../domain';
import {
  CrearProgramaUseCase,
  ObtenerProgramaUseCase,
  ListarProgramasUseCase,
  CambiarEstadoProgramaUseCase,
  EliminarProgramaUseCase,
  ActualizarProgramaUseCase,
} from '../use-cases/programa-use-cases';
import {
  CrearProgramaDTO,
  CambiarEstadoProgramaDTO,
  ObtenerProgramaDTO,
  ListarProgramasDTO,
  EliminarProgramaDTO,
  ActualizarProgramaDTO,
} from '../dtos/programa-in';
import { ProgramaDTO, ListaProgramasDTO } from '../dtos/programa-out';

export class ProgramaApplicationService {
  private crearProgramaUseCase: CrearProgramaUseCase;
  private cambiarEstadoUseCase: CambiarEstadoProgramaUseCase;
  private obtenerProgramaUseCase: ObtenerProgramaUseCase;
  private listarProgramasUseCase: ListarProgramasUseCase;
  private eliminarProgramaUseCase: EliminarProgramaUseCase;
  private actualizarProgramaUseCase: ActualizarProgramaUseCase;

  constructor(programaRepository: ProgramaRepository) {
    this.crearProgramaUseCase = new CrearProgramaUseCase(programaRepository);
    this.cambiarEstadoUseCase = new CambiarEstadoProgramaUseCase(programaRepository);
    this.obtenerProgramaUseCase = new ObtenerProgramaUseCase(programaRepository);
    this.listarProgramasUseCase = new ListarProgramasUseCase(programaRepository);
    this.eliminarProgramaUseCase = new EliminarProgramaUseCase(programaRepository);
    this.actualizarProgramaUseCase = new ActualizarProgramaUseCase(programaRepository);
  }

  /**
   * Crea un nuevo programa
   */
  async crear(input: CrearProgramaDTO): Promise<ProgramaDTO> {
    return await this.crearProgramaUseCase.execute(input);
  }

  /**
   * Cambia el estado de un programa
   */
  async cambiarEstado(input: CambiarEstadoProgramaDTO): Promise<ProgramaDTO> {
    return await this.cambiarEstadoUseCase.execute(input);
  }

  /**
   * Obtiene un programa por ID
   */
  async obtener(input: ObtenerProgramaDTO): Promise<ProgramaDTO> {
    return await this.obtenerProgramaUseCase.execute(input);
  }

  /**
   * Lista programas con filtros y paginación
   */
  async listar(input: ListarProgramasDTO): Promise<ListaProgramasDTO> {
    return await this.listarProgramasUseCase.execute(input);
  }

  /**
   * Elimina un programa
   */
  async eliminar(input: EliminarProgramaDTO): Promise<boolean> {
    return await this.eliminarProgramaUseCase.execute(input);
  }

  /**
   * Actualiza un programa existente
   */
  async actualizar(input: ActualizarProgramaDTO): Promise<ProgramaDTO> {
    return await this.actualizarProgramaUseCase.execute(input);
  }
}
