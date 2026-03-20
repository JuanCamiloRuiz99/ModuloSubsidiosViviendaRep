/**
 * Entidad de Dominio: Visita
 */

import { BaseEntity } from '../../../shared/domain/base-entity';

export enum EstadoVisita {
  PROGRAMADA = 'PROGRAMADA',
  REALIZANDO = 'REALIZANDO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoVisita {
  INICIAL = 'INICIAL',
  SEGUIMIENTO = 'SEGUIMIENTO',
  VERIFICACION = 'VERIFICACION',
  FINAL = 'FINAL',
}

export class Visita extends BaseEntity {
  constructor(
    id: string,
    public postulacionId: string,
    public postulanteId: string,
    public programaId: string,
    public tipoVisita: TipoVisita,
    public estado: EstadoVisita,
    public direccion: string,
    public fechaProgramada: Date,
    public inspectorId?: string,
    public observaciones?: string,
    public fotosUrl?: string,
    public calificacion?: number,
    public motivoCancelacion?: string,
    public fechaRealizacion?: Date,
    public fechaCancelacion?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public iniciar(inspectorId: string): void {
    if (this.estado !== EstadoVisita.PROGRAMADA) {
      throw new Error('Solo se pueden iniciar visitas programadas');
    }
    this.inspectorId = inspectorId;
    this.estado = EstadoVisita.REALIZANDO;
    this.updatedAt = new Date();
  }

  public completar(calificacion: number, observaciones?: string, fotosUrl?: string): void {
    if (this.estado !== EstadoVisita.REALIZANDO) {
      throw new Error('Solo se pueden completar visitas en realización');
    }
    this.calificacion = calificacion;
    this.observaciones = observaciones;
    this.fotosUrl = fotosUrl;
    this.estado = EstadoVisita.COMPLETADA;
    this.fechaRealizacion = new Date();
    this.updatedAt = new Date();
  }

  public cancelar(motivo: string): void {
    if (this.estado === EstadoVisita.CANCELADA || this.estado === EstadoVisita.COMPLETADA) {
      throw new Error('No se puede cancelar una visita completada o ya cancelada');
    }
    this.motivoCancelacion = motivo;
    this.estado = EstadoVisita.CANCELADA;
    this.fechaCancelacion = new Date();
    this.updatedAt = new Date();
  }

  public esAprobada(): boolean {
    return this.calificacion ? this.calificacion >= 60 : false;
  }

  public esCompletada(): boolean {
    return this.estado === EstadoVisita.COMPLETADA;
  }

  public toPrimitives() {
    return {
      id: this.id,
      postulacionId: this.postulacionId,
      postulanteId: this.postulanteId,
      programaId: this.programaId,
      tipoVisita: this.tipoVisita,
      estado: this.estado,
      direccion: this.direccion,
      fechaProgramada: this.fechaProgramada,
      inspectorId: this.inspectorId,
      observaciones: this.observaciones,
      fotosUrl: this.fotosUrl,
      calificacion: this.calificacion,
      motivoCancelacion: this.motivoCancelacion,
      fechaRealizacion: this.fechaRealizacion,
      fechaCancelacion: this.fechaCancelacion,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrimitives(data: any): Visita {
    return new Visita(
      data.id,
      data.postulacionId,
      data.postulanteId,
      data.programaId,
      data.tipoVisita,
      data.estado,
      data.direccion,
      data.fechaProgramada,
      data.inspectorId,
      data.observaciones,
      data.fotosUrl,
      data.calificacion,
      data.motivoCancelacion,
      data.fechaRealizacion,
      data.fechaCancelacion,
      data.createdAt,
      data.updatedAt
    );
  }
}
