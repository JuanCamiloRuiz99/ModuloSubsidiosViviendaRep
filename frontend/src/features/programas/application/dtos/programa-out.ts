/**
 * DTOs de salida para el módulo Programas
 * 
 * Define la estructura de datos para respuestas desde la aplicación
 */

import type { PaginatedResponse } from '../../../../shared/types';

/**
 * DTO con la información de un programa
 */
export class ProgramaDTO {
  id: string;
  nombre: string;
  descripcion: string;
  entidadResponsable: string;
  codigoPrograma: string;
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;

  constructor(
    id: string,
    nombre: string,
    descripcion: string,
    entidadResponsable: string,
    codigoPrograma: string,
    estado: string,
    fechaCreacion: Date,
    fechaActualizacion: Date
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.entidadResponsable = entidadResponsable;
    this.codigoPrograma = codigoPrograma;
    this.estado = estado;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  static fromEntity(props: any): ProgramaDTO {
    return new ProgramaDTO(
      props.id,
      props.nombre,
      props.descripcion,
      props.entidadResponsable,
      props.codigoPrograma,
      props.estado,
      props.fechaCreacion ?? props.createdAt,
      props.fechaActualizacion ?? props.updatedAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      entidadResponsable: this.entidadResponsable,
      codigoPrograma: this.codigoPrograma,
      estado: this.estado,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}

/**
 * DTO para lista de programas con paginación
 */
export class ListaProgramasDTO {
  items: ProgramaDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  constructor(
    items: ProgramaDTO[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = totalPages;
  }

  static fromPaginatedResult(result: PaginatedResponse<any>): ListaProgramasDTO {
    return new ListaProgramasDTO(
      result.items.map((item) => ProgramaDTO.fromEntity(item.toPrimitives?.() || item)),
      result.total,
      result.page,
      result.pageSize,
      result.totalPages
    );
  }

  toJSON() {
    return {
      items: this.items.map((item) => item.toJSON()),
      total: this.total,
      page: this.page,
      pageSize: this.pageSize,
      totalPages: this.totalPages,
    };
  }
}

/**
 * DTO para estadísticas de programas
 */
export class EstadisticasProgramasDTO {
  total: number;
  borrador: number;
  activo: number;
  inhabilitado: number;

  constructor(
    total: number,
    borrador: number,
    activo: number,
    inhabilitado: number
  ) {
    this.total = total;
    this.borrador = borrador;
    this.activo = activo;
    this.inhabilitado = inhabilitado;
  }

  static fromRawData(data: any): EstadisticasProgramasDTO {
    const porEstado = data.por_estado ?? data;
    return new EstadisticasProgramasDTO(
      data.total ?? 0,
      porEstado.BORRADOR ?? 0,
      porEstado.ACTIVO ?? 0,
      porEstado.INHABILITADO ?? 0
    );
  }

  toJSON() {
    return {
      total: this.total,
      borrador: this.borrador,
      activo: this.activo,
      inhabilitado: this.inhabilitado,
    };
  }
}
