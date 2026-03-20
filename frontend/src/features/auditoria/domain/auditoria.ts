/**
 * Entidad de Dominio: Auditoria
 */

import { BaseEntity } from '../../../shared/domain/base-entity';

export enum TipoAccion {
  CREAR = 'CREAR',
  ACTUALIZAR = 'ACTUALIZAR',
  ELIMINAR = 'ELIMINAR',
}

export class Auditoria extends BaseEntity {
  tipoAccion: TipoAccion;
  entidad: string;
  entidadId: string;
  usuarioId: string;
  numeroDocumento?: string;
  cambios?: any;
  detalles?: string;
  ipAddress?: string;
  navegador?: string;

  constructor(
    id: string,
    tipoAccion: TipoAccion,
    entidad: string,
    entidadId: string,
    usuarioId: string,
    numeroDocumento?: string,
    cambios?: any,
    detalles?: string,
    ipAddress?: string,
    navegador?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.tipoAccion = tipoAccion;
    this.entidad = entidad;
    this.entidadId = entidadId;
    this.usuarioId = usuarioId;
    this.numeroDocumento = numeroDocumento;
    this.cambios = cambios;
    this.detalles = detalles;
    this.ipAddress = ipAddress;
    this.navegador = navegador;
  }

  esCreacion(): boolean {
    return this.tipoAccion === TipoAccion.CREAR;
  }

  esActualizacion(): boolean {
    return this.tipoAccion === TipoAccion.ACTUALIZAR;
  }

  esEliminacion(): boolean {
    return this.tipoAccion === TipoAccion.ELIMINAR;
  }

  obtenerId(): string {
    return this.id;
  }

  toPrimitives() {
    return {
      id: this.id,
      tipoAccion: this.tipoAccion,
      entidad: this.entidad,
      entidadId: this.entidadId,
      usuarioId: this.usuarioId,
      numeroDocumento: this.numeroDocumento,
      cambios: this.cambios,
      detalles: this.detalles,
      ipAddress: this.ipAddress,
      navegador: this.navegador,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrimitives(data: any): Auditoria {
    return new Auditoria(
      data.id,
      data.tipoAccion,
      data.entidad,
      data.entidadId,
      data.usuarioId,
      data.numeroDocumento,
      data.cambios,
      data.detalles,
      data.ipAddress,
      data.navegador,
      data.createdAt,
      data.updatedAt
    );
  }
}
