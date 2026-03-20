/**
 * Entidad de Dominio: Postulación
 */

import { BaseEntity } from '../../../shared/domain/base-entity';

export enum EstadoPostulacion {
  REGISTRADA = 'REGISTRADA',
  REVISADA = 'REVISADA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  ANULADA = 'ANULADA',
}

export class Postulacion extends BaseEntity {
  constructor(
    id: string,
    public numeroDocumento: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public telefono: string,
    public direccion: string,
    public programaId: string,
    public estado: EstadoPostulacion,
    public puntaje: number,
    public motivo?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public iniciarRevision(): void {
    if (this.estado !== EstadoPostulacion.REGISTRADA) {
      throw new Error('Solo se pueden revisar postulaciones registradas');
    }
    this.estado = EstadoPostulacion.REVISADA;
    this.updatedAt = new Date();
  }

  public aprobar(): void {
    if (this.estado !== EstadoPostulacion.REVISADA) {
      throw new Error('Solo se pueden aprobar postulaciones revisadas');
    }
    this.estado = EstadoPostulacion.APROBADA;
    this.updatedAt = new Date();
  }

  public rechazar(motivo: string): void {
    if (this.estado !== EstadoPostulacion.REVISADA) {
      throw new Error('Solo se pueden rechazar postulaciones revisadas');
    }
    this.estado = EstadoPostulacion.RECHAZADA;
    this.motivo = motivo;
    this.updatedAt = new Date();
  }

  public anular(motivo: string): void {
    if (this.estado === EstadoPostulacion.ANULADA) {
      throw new Error('La postulación ya está anulada');
    }
    this.estado = EstadoPostulacion.ANULADA;
    this.motivo = motivo;
    this.updatedAt = new Date();
  }

  public esAprobada(): boolean {
    return this.estado === EstadoPostulacion.APROBADA;
  }

  public esRechazada(): boolean {
    return this.estado === EstadoPostulacion.RECHAZADA;
  }

  public puedeSerModificada(): boolean {
    return this.estado === EstadoPostulacion.REGISTRADA;
  }

  public toPrimitives() {
    return {
      id: this.id,
      numeroDocumento: this.numeroDocumento,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      programaId: this.programaId,
      estado: this.estado,
      puntaje: this.puntaje,
      motivo: this.motivo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrimitives(data: any): Postulacion {
    return new Postulacion(
      data.id,
      data.numeroDocumento,
      data.nombre,
      data.apellido,
      data.email,
      data.telefono,
      data.direccion,
      data.programaId,
      data.estado,
      data.puntaje,
      data.motivo,
      data.createdAt,
      data.updatedAt
    );
  }
}
