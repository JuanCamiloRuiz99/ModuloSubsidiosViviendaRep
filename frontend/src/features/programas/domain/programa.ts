/**
 * Entidad de Dominio: Programa
 */

import { BaseEntity } from '../../../shared/domain/base-entity';

export enum EstadoPrograma {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  INHABILITADO = 'INHABILITADO',
  CULMINADO = 'CULMINADO',
}

export class Programa extends BaseEntity {
  constructor(
    id: string,
    public nombre: string,
    public descripcion: string,
    public entidadResponsable: string,
    public codigoPrograma: string,
    public estado: EstadoPrograma,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public publicar(): void {
    if (this.estado !== EstadoPrograma.BORRADOR) {
      throw new Error('Solo se pueden publicar programas en estado BORRADOR');
    }
    this.estado = EstadoPrograma.ACTIVO;
    this.updatedAt = new Date();
  }

  public inhabilitar(): void {
    if (this.estado === EstadoPrograma.INHABILITADO) {
      throw new Error('El programa ya está inhabilitado');
    }
    this.estado = EstadoPrograma.INHABILITADO;
    this.updatedAt = new Date();
  }

  public activar(): void {
    if (this.estado !== EstadoPrograma.INHABILITADO) {
      throw new Error('Solo se pueden activar programas inhabilitados');
    }
    this.estado = EstadoPrograma.ACTIVO;
    this.updatedAt = new Date();
  }

  public cambiarEstado(nuevoEstado: EstadoPrograma): void {
    if (nuevoEstado === this.estado) {
      throw new Error('El nuevo estado es igual al actual');
    }
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  public esActivo(): boolean {
    return this.estado === EstadoPrograma.ACTIVO;
  }

  public toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      entidadResponsable: this.entidadResponsable,
      codigoPrograma: this.codigoPrograma,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrimitives(data: any): Programa {
    return new Programa(
      data.id,
      data.nombre,
      data.descripcion,
      data.entidadResponsable,
      data.codigoPrograma,
      data.estado,
      data.createdAt,
      data.updatedAt
    );
  }
}
