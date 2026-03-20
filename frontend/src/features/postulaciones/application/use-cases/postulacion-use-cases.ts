/**
 * Use Cases para Postulaciones
 */

import { Postulacion, PostulacionRepository } from '../../domain';
import {
  CrearPostulacionDTO,
  ObtenerPostulacionDTO,
  ListarPostulacionesDTO,
  RevisarPostulacionDTO,
  AprobarPostulacionDTO,
  RechazarPostulacionDTO,
  AnularPostulacionDTO,
} from '../dtos/postulacion-in';
import { PostulacionDTO, ListaPostulacionesDTO, EstadisticasPostulacionesDTO } from '../dtos/postulacion-out';

export class CrearPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: CrearPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = new Postulacion(
      `post_${Date.now()}`,
      input.numeroDocumento,
      input.nombre,
      input.apellido,
      input.email,
      input.telefono,
      input.direccion,
      input.programaId,
      'REGISTRADA' as any,
      0
    );

    const created = await this.repository.create(postulacion);
    return PostulacionDTO.fromDomain(created);
  }
}

export class ObtenerPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: ObtenerPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = await this.repository.findById(input.id);
    if (!postulacion) {
      throw new Error(`Postulación con ID ${input.id} no encontrada`);
    }
    return PostulacionDTO.fromDomain(postulacion);
  }
}

export class ListarPostulacionesUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: ListarPostulacionesDTO): Promise<ListaPostulacionesDTO> {
    const criteria = {
      page: input.page,
      pageSize: input.pageSize,
      estado: input.estado,
      programaId: input.programaId,
    };

    const result = await this.repository.findAll(criteria);
    const postulacionDTOs = result.items.map((p) => PostulacionDTO.fromDomain(p));

    return new ListaPostulacionesDTO(
      postulacionDTOs,
      result.total,
      input.page,
      input.pageSize,
      Math.ceil(result.total / input.pageSize)
    );
  }
}

export class RevisarPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: RevisarPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = await this.repository.findById(input.id);
    if (!postulacion) {
      throw new Error(`Postulación con ID ${input.id} no encontrada`);
    }

    postulacion.iniciarRevision();
    const updated = await this.repository.update(postulacion);
    return PostulacionDTO.fromDomain(updated);
  }
}

export class AprobarPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: AprobarPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = await this.repository.findById(input.id);
    if (!postulacion) {
      throw new Error(`Postulación con ID ${input.id} no encontrada`);
    }

    postulacion.puntaje = input.puntaje;
    postulacion.aprobar();
    const updated = await this.repository.update(postulacion);
    return PostulacionDTO.fromDomain(updated);
  }
}

export class RechazarPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: RechazarPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = await this.repository.findById(input.id);
    if (!postulacion) {
      throw new Error(`Postulación con ID ${input.id} no encontrada`);
    }

    postulacion.rechazar(input.motivo);
    const updated = await this.repository.update(postulacion);
    return PostulacionDTO.fromDomain(updated);
  }
}

export class AnularPostulacionUseCase {
  constructor(private repository: PostulacionRepository) {}

  async execute(input: AnularPostulacionDTO): Promise<PostulacionDTO> {
    const postulacion = await this.repository.findById(input.id);
    if (!postulacion) {
      throw new Error(`Postulación con ID ${input.id} no encontrada`);
    }

    postulacion.anular(input.motivo);
    const updated = await this.repository.update(postulacion);
    return PostulacionDTO.fromDomain(updated);
  }
}
