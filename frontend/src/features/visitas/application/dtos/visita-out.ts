/**
 * DTOs de salida para Visitas
 */

import { Visita } from '../../domain/visita';

export class VisitaDTO {
  constructor(
    public id: string,
    public postulacionId: string,
    public postulanteId: string,
    public programaId: string,
    public tipoVisita: string,
    public estado: string,
    public direccion: string,
    public fechaProgramada: Date,
    public inspectorId?: string,
    public observaciones?: string,
    public fotosUrl?: string,
    public calificacion?: number,
    public motivoCancelacion?: string,
    public fechaRealizacion?: Date,
    public fechaCancelacion?: Date,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static fromDomain(visita: Visita): VisitaDTO {
    return new VisitaDTO(
      visita.id,
      visita.postulacionId,
      visita.postulanteId,
      visita.programaId,
      visita.tipoVisita,
      visita.estado,
      visita.direccion,
      visita.fechaProgramada,
      visita.inspectorId,
      visita.observaciones,
      visita.fotosUrl,
      visita.calificacion,
      visita.motivoCancelacion,
      visita.fechaRealizacion,
      visita.fechaCancelacion,
      visita.createdAt,
      visita.updatedAt
    );
  }
}

export class ListaVisitasDTO {
  constructor(
    public items: VisitaDTO[],
    public total: number,
    public page: number,
    public pageSize: number,
    public totalPages: number
  ) {}

  static fromData(data: any): ListaVisitasDTO {
    return new ListaVisitasDTO(
      data.items.map((item: any) => new VisitaDTO(
        item.id,
        item.postulacionId,
        item.postulanteId,
        item.programaId,
        item.tipoVisita,
        item.estado,
        item.direccion,
        item.fechaProgramada,
        item.inspectorId,
        item.observaciones,
        item.fotosUrl,
        item.calificacion,
        item.motivoCancelacion,
        item.fechaRealizacion,
        item.fechaCancelacion,
        item.createdAt,
        item.updatedAt
      )),
      data.total,
      data.page,
      data.pageSize,
      data.totalPages
    );
  }
}
