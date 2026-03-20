/**
 * Use Cases para Auditoria
 */

import type { AuditoriaRepository } from '../../domain';
import { Auditoria, TipoAccion } from '../../domain';
import {
  CrearAuditoriaDTO,
  ObtenerAuditoriaDTO,
  ListarAuditoriasDTO,
  ListarPorEntidadDTO,
  ListarPorUsuarioDTO,
} from '../dtos/auditoria-in';
import { AuditoriaDTO, ListaAuditoriasDTO } from '../dtos/auditoria-out';

export class CrearAuditoriaUseCase {
  constructor(repository: AuditoriaRepository) {
    this.repository = repository;
  }
  private repository: AuditoriaRepository;

  async execute(input: CrearAuditoriaDTO): Promise<AuditoriaDTO> {
    const auditoria = new Auditoria(
      `aud_${Date.now()}`,
      input.tipoAccion as TipoAccion,
      input.entidad,
      input.entidadId,
      input.usuarioId,
      input.numeroDocumento,
      input.cambios,
      input.detalles
    );

    const created = await this.repository.create(auditoria);
    return AuditoriaDTO.fromDomain(created);
  }
}

export class ObtenerAuditoriaUseCase {
  constructor(repository: AuditoriaRepository) {
    this.repository = repository;
  }
  private repository: AuditoriaRepository;

  async execute(input: ObtenerAuditoriaDTO): Promise<AuditoriaDTO> {
    const auditoria = await this.repository.findById(input.id);
    if (!auditoria) {
      throw new Error(`Auditoria con ID ${input.id} no encontrada`);
    }
    return AuditoriaDTO.fromDomain(auditoria);
  }
}

export class ListarAuditoriasUseCase {
  constructor(repository: AuditoriaRepository) {
    this.repository = repository;
  }
  private repository: AuditoriaRepository;

  async execute(input: ListarAuditoriasDTO): Promise<ListaAuditoriasDTO> {
    const criteria = {
      page: input.page,
      pageSize: input.pageSize,
      tipoAccion: input.tipoAccion,
      entidad: input.entidad,
      usuarioId: input.usuarioId,
      fecha: input.fecha,
    };

    const result = await this.repository.findAll(criteria);
    const auditoriaDTOs = result.items.map((a) => AuditoriaDTO.fromDomain(a));

    return new ListaAuditoriasDTO(
      auditoriaDTOs,
      result.total,
      input.page,
      input.pageSize,
      Math.ceil(result.total / input.pageSize)
    );
  }
}

export class ListarPorEntidadUseCase {
  constructor(repository: AuditoriaRepository) {
    this.repository = repository;
  }
  private repository: AuditoriaRepository;

  async execute(input: ListarPorEntidadDTO): Promise<ListaAuditoriasDTO> {
    const auditorias = await this.repository.findByEntidadId(input.entidadId);
    
    const items = auditorias
      .slice((input.page - 1) * input.pageSize, input.page * input.pageSize)
      .map((a) => AuditoriaDTO.fromDomain(a));

    return new ListaAuditoriasDTO(
      items,
      auditorias.length,
      input.page,
      input.pageSize,
      Math.ceil(auditorias.length / input.pageSize)
    );
  }
}

export class ListarPorUsuarioUseCase {
  constructor(repository: AuditoriaRepository) {
    this.repository = repository;
  }
  private repository: AuditoriaRepository;

  async execute(input: ListarPorUsuarioDTO): Promise<ListaAuditoriasDTO> {
    const auditorias = await this.repository.findByUsuarioId(input.usuarioId);
    
    const items = auditorias
      .slice((input.page - 1) * input.pageSize, input.page * input.pageSize)
      .map((a) => AuditoriaDTO.fromDomain(a));

    return new ListaAuditoriasDTO(
      items,
      auditorias.length,
      input.page,
      input.pageSize,
      Math.ceil(auditorias.length / input.pageSize)
    );
  }
}
