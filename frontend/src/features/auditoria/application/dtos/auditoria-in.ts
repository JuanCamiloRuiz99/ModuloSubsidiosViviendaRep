/**
 * DTOs de entrada para Auditoria
 */

import { validateNotEmpty, validateLength } from '../../../shared/application/validators';

export class CrearAuditoriaDTO {
  tipoAccion: string;
  entidad: string;
  entidadId: string;
  usuarioId: string;
  numeroDocumento?: string;
  cambios?: any;
  detalles?: string;

  constructor(
    tipoAccion: string,
    entidad: string,
    entidadId: string,
    usuarioId: string,
    numeroDocumento?: string,
    cambios?: any,
    detalles?: string
  ) {
    this.tipoAccion = tipoAccion;
    this.entidad = entidad;
    this.entidadId = entidadId;
    this.usuarioId = usuarioId;
    this.numeroDocumento = numeroDocumento;
    this.cambios = cambios;
    this.detalles = detalles;
    this.validate();
  }

  private validate(): void {
    validateNotEmpty(this.tipoAccion, 'Tipo de acción');
    validateNotEmpty(this.entidad, 'Entidad');
    validateNotEmpty(this.entidadId, 'ID de entidad');
    validateNotEmpty(this.usuarioId, 'ID de usuario');
    if (this.detalles) {
      validateLength(this.detalles, 1, 1000, 'Detalles');
    }
  }
}

export class ObtenerAuditoriaDTO {
  id: string;

  constructor(id: string) {
    this.id = id;
    validateNotEmpty(id, 'ID');
  }
}

export class ListarAuditoriasDTO {
  page: number;
  pageSize: number;
  tipoAccion?: string;
  entidad?: string;
  usuarioId?: string;
  fecha?: Date;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    tipoAccion?: string,
    entidad?: string,
    usuarioId?: string,
    fecha?: Date
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.tipoAccion = tipoAccion;
    this.entidad = entidad;
    this.usuarioId = usuarioId;
    this.fecha = fecha;

    if (page < 1) throw new Error('Página debe ser mayor a 0');
    if (pageSize < 1) throw new Error('Tamaño de página debe ser mayor a 0');
  }
}

export class ListarPorEntidadDTO {
  entidadId: string;
  page: number;
  pageSize: number;

  constructor(entidadId: string, page: number = 1, pageSize: number = 10) {
    this.entidadId = entidadId;
    this.page = page;
    this.pageSize = pageSize;
    validateNotEmpty(entidadId, 'ID de entidad');
  }
}

export class ListarPorUsuarioDTO {
  usuarioId: string;
  page: number;
  pageSize: number;

  constructor(usuarioId: string, page: number = 1, pageSize: number = 10) {
    this.usuarioId = usuarioId;
    this.page = page;
    this.pageSize = pageSize;
    validateNotEmpty(usuarioId, 'ID de usuario');
  }
}
