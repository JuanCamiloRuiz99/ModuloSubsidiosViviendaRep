/**
 * Use Cases para Programas
 */

import { Programa, EstadoPrograma } from '../../domain';
import type { ProgramaRepository } from '../../domain';
import {
  CrearProgramaDTO,
  ObtenerProgramaDTO,
  ListarProgramasDTO,
  CambiarEstadoProgramaDTO,
  EliminarProgramaDTO,
  ActualizarProgramaDTO,
} from '../dtos/programa-in';
import { ProgramaDTO, ListaProgramasDTO } from '../dtos/programa-out';

export class CrearProgramaUseCase {
  repository: ProgramaRepository;

  constructor(repository: ProgramaRepository) {
    this.repository = repository;
  }

  async execute(input: CrearProgramaDTO): Promise<ProgramaDTO> {
    const programa = new Programa(
      `prog_${Date.now()}`,
      input.nombre,
      input.descripcion,
      input.entidadResponsable,
      `PROG-${Date.now()}`,
      EstadoPrograma.BORRADOR
    );

    const created = await this.repository.create(programa);
    return ProgramaDTO.fromEntity(created.toPrimitives());
  }
}

export class ObtenerProgramaUseCase {
  repository: ProgramaRepository;

  constructor(repository: ProgramaRepository) {
    this.repository = repository;
  }

  async execute(input: ObtenerProgramaDTO): Promise<ProgramaDTO> {
    const programa = await this.repository.findById(input.id);
    if (!programa) {
      throw new Error(`Programa con ID ${input.id} no encontrado`);
    }
    return ProgramaDTO.fromEntity(programa.toPrimitives());
  }
}

export class ListarProgramasUseCase {
  repository: ProgramaRepository;

  constructor(repository: ProgramaRepository) {
    this.repository = repository;
  }

  async execute(input: ListarProgramasDTO): Promise<ListaProgramasDTO> {
    const criteria = {
      page: input.page,
      pageSize: input.pageSize,
      estado: input.estado,
      busqueda: input.busqueda,
      ordenar: input.ordenar,
    };

    const result = await this.repository.findAll(criteria);
    const programaDTOs = result.items.map((p) => ProgramaDTO.fromEntity(p.toPrimitives?.() || p));

    return new ListaProgramasDTO(
      programaDTOs,
      result.total,
      input.page,
      input.pageSize,
      Math.ceil(result.total / input.pageSize)
    );
  }
}

export class CambiarEstadoProgramaUseCase {
  repository: ProgramaRepository;

  constructor(repository: ProgramaRepository) {
    this.repository = repository;
  }

  async execute(input: CambiarEstadoProgramaDTO): Promise<ProgramaDTO> {
    const updated = await this.repository.cambiarEstado(input.id, input.nuevoEstado);
    return ProgramaDTO.fromEntity(updated.toPrimitives());
  }
}

export class EliminarProgramaUseCase {
  repository: ProgramaRepository;

  constructor(repository: ProgramaRepository) {
    this.repository = repository;
  }

  async execute(input: EliminarProgramaDTO): Promise<boolean> {
    return this.repository.delete(input.id);
  }
}
export class ActualizarProgramaUseCase {
  constructor(private readonly repository: ProgramaRepository) {}

  async execute(input: ActualizarProgramaDTO): Promise<ProgramaDTO> {
    const existente = await this.repository.findById(input.id);
    if (!existente) throw new Error(`Programa ${input.id} no encontrado`);
    existente.nombre = input.nombre;
    existente.descripcion = input.descripcion;
    existente.entidadResponsable = input.entidadResponsable;
    const updated = await this.repository.update(existente);
    return ProgramaDTO.fromEntity(updated.toPrimitives());
  }
}