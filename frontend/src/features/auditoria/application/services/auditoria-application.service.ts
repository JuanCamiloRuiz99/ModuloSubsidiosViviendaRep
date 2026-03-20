/**
 * Servicio de Aplicación para Auditoria
 */

import type { AuditoriaRepository } from '../../domain';
import {
  CrearAuditoriaDTO,
  ObtenerAuditoriaDTO,
  ListarAuditoriasDTO,
  ListarPorEntidadDTO,
  ListarPorUsuarioDTO,
} from '../dtos/auditoria-in';
import { AuditoriaDTO, ListaAuditoriasDTO } from '../dtos/auditoria-out';
import {
  CrearAuditoriaUseCase,
  ObtenerAuditoriaUseCase,
  ListarAuditoriasUseCase,
  ListarPorEntidadUseCase,
  ListarPorUsuarioUseCase,
} from './auditoria-use-cases';

export class AuditoriaApplicationService {
  private crearUseCase: CrearAuditoriaUseCase;
  private obtenerUseCase: ObtenerAuditoriaUseCase;
  private listarUseCase: ListarAuditoriasUseCase;
  private listarPorEntidadUseCase: ListarPorEntidadUseCase;
  private listarPorUsuarioUseCase: ListarPorUsuarioUseCase;

  constructor(repository: AuditoriaRepository) {
    this.crearUseCase = new CrearAuditoriaUseCase(repository);
    this.obtenerUseCase = new ObtenerAuditoriaUseCase(repository);
    this.listarUseCase = new ListarAuditoriasUseCase(repository);
    this.listarPorEntidadUseCase = new ListarPorEntidadUseCase(repository);
    this.listarPorUsuarioUseCase = new ListarPorUsuarioUseCase(repository);
  }

  async crear(input: CrearAuditoriaDTO): Promise<AuditoriaDTO> {
    return this.crearUseCase.execute(input);
  }

  async obtener(input: ObtenerAuditoriaDTO): Promise<AuditoriaDTO> {
    return this.obtenerUseCase.execute(input);
  }

  async listar(input: ListarAuditoriasDTO): Promise<ListaAuditoriasDTO> {
    return this.listarUseCase.execute(input);
  }

  async listarPorEntidad(input: ListarPorEntidadDTO): Promise<ListaAuditoriasDTO> {
    return this.listarPorEntidadUseCase.execute(input);
  }

  async listarPorUsuario(input: ListarPorUsuarioDTO): Promise<ListaAuditoriasDTO> {
    return this.listarPorUsuarioUseCase.execute(input);
  }
}
