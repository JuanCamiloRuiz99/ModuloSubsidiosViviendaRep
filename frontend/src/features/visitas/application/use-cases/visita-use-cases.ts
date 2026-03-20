/**
 * Use Cases para Visitas
 */

import { Visita, VisitaRepository, TipoVisita, EstadoVisita } from '../../domain';
import {
  CrearVisitaDTO,
  ObtenerVisitaDTO,
  ListarVisitasDTO,
  IniciarVisitaDTO,
  CompletarVisitaDTO,
  CancelarVisitaDTO,
} from '../dtos/visita-in';
import { VisitaDTO, ListaVisitasDTO } from '../dtos/visita-out';

export class CrearVisitaUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: CrearVisitaDTO): Promise<VisitaDTO> {
    const visita = new Visita(
      `vis_${Date.now()}`,
      input.postulacionId,
      input.postulanteId,
      input.programaId,
      input.tipoVisita as TipoVisita,
      EstadoVisita.PROGRAMADA,
      input.direccion,
      input.fechaProgramada,
      input.inspectorId
    );

    const created = await this.repository.create(visita);
    return VisitaDTO.fromDomain(created);
  }
}

export class ObtenerVisitaUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: ObtenerVisitaDTO): Promise<VisitaDTO> {
    const visita = await this.repository.findById(input.id);
    if (!visita) {
      throw new Error(`Visita con ID ${input.id} no encontrada`);
    }
    return VisitaDTO.fromDomain(visita);
  }
}

export class ListarVisitasUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: ListarVisitasDTO): Promise<ListaVisitasDTO> {
    const criteria = {
      page: input.page,
      pageSize: input.pageSize,
      estado: input.estado,
      programaId: input.programaId,
      postulanteId: input.postulanteId,
      inspectorId: input.inspectorId,
    };

    const result = await this.repository.findAll(criteria);
    const visitaDTOs = result.items.map((v) => VisitaDTO.fromDomain(v));

    return new ListaVisitasDTO(
      visitaDTOs,
      result.total,
      input.page,
      input.pageSize,
      Math.ceil(result.total / input.pageSize)
    );
  }
}

export class IniciarVisitaUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: IniciarVisitaDTO): Promise<VisitaDTO> {
    const visita = await this.repository.findById(input.id);
    if (!visita) {
      throw new Error(`Visita con ID ${input.id} no encontrada`);
    }

    visita.iniciar(input.inspectorId);
    const updated = await this.repository.update(visita);
    return VisitaDTO.fromDomain(updated);
  }
}

export class CompletarVisitaUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: CompletarVisitaDTO): Promise<VisitaDTO> {
    const visita = await this.repository.findById(input.id);
    if (!visita) {
      throw new Error(`Visita con ID ${input.id} no encontrada`);
    }

    visita.completar(input.calificacion, input.observaciones, input.fotosUrl);
    const updated = await this.repository.update(visita);
    return VisitaDTO.fromDomain(updated);
  }
}

export class CancelarVisitaUseCase {
  constructor(private repository: VisitaRepository) {}

  async execute(input: CancelarVisitaDTO): Promise<VisitaDTO> {
    const visita = await this.repository.findById(input.id);
    if (!visita) {
      throw new Error(`Visita con ID ${input.id} no encontrada`);
    }

    visita.cancelar(input.motivo);
    const updated = await this.repository.update(visita);
    return VisitaDTO.fromDomain(updated);
  }
}
