/**
 * DTOs de salida para Auditoria
 */

import { Auditoria } from '../../domain/auditoria';

export class AuditoriaDTO {
  id: string;
  tipoAccion: string;
  entidad: string;
  entidadId: string;
  usuarioId: string;
  numeroDocumento?: string;
  cambios?: any;
  detalles?: string;
  ipAddress?: string;
  navegador?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    tipoAccion: string,
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
    this.id = id;
    this.tipoAccion = tipoAccion;
    this.entidad = entidad;
    this.entidadId = entidadId;
    this.usuarioId = usuarioId;
    this.numeroDocumento = numeroDocumento;
    this.cambios = cambios;
    this.detalles = detalles;
    this.ipAddress = ipAddress;
    this.navegador = navegador;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDomain(auditoria: Auditoria): AuditoriaDTO {
    return new AuditoriaDTO(
      auditoria.id,
      auditoria.tipoAccion,
      auditoria.entidad,
      auditoria.entidadId,
      auditoria.usuarioId,
      auditoria.numeroDocumento,
      auditoria.cambios,
      auditoria.detalles,
      auditoria.ipAddress,
      auditoria.navegador,
      auditoria.createdAt,
      auditoria.updatedAt
    );
  }
}

export class ListaAuditoriasDTO {
  items: AuditoriaDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  constructor(
    items: AuditoriaDTO[],
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

  static fromData(data: any): ListaAuditoriasDTO {
    return new ListaAuditoriasDTO(
      data.items.map((item: any) =>
        new AuditoriaDTO(
          item.id,
          item.tipoAccion,
          item.entidad,
          item.entidadId,
          item.usuarioId,
          item.numeroDocumento,
          item.cambios,
          item.detalles,
          item.ipAddress,
          item.navegador,
          item.createdAt,
          item.updatedAt
        )
      ),
      data.total,
      data.page,
      data.pageSize,
      data.totalPages
    );
  }
}

export class EstadisticasAuditoriaDTO {
  constructor(
    public total: number,
    public crear: number,
    public actualizar: number,
    public eliminar: number
  ) {}

  static fromData(data: any): EstadisticasAuditoriaDTO {
    return new EstadisticasAuditoriaDTO(data.total, data.crear, data.actualizar, data.eliminar);
  }
}
