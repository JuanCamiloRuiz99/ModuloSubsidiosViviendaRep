/**
 * DTOs de entrada para Visitas
 */

import { validateLength, validateNotEmpty } from '../../../../shared/application/validators';

export class CrearVisitaDTO {
  constructor(
    public postulacionId: string,
    public postulanteId: string,
    public programaId: string,
    public tipoVisita: string,
    public direccion: string,
    public fechaProgramada?: Date,
    public inspectorId?: string
  ) {
    this.validate();
  }

  private validate(): void {
    validateNotEmpty(this.postulacionId, 'Postulación ID');
    validateNotEmpty(this.postulanteId, 'Postulante ID');
    validateNotEmpty(this.programaId, 'Programa ID');
    validateNotEmpty(this.tipoVisita, 'Tipo de visita');
    validateNotEmpty(this.direccion, 'Dirección');
    validateLength(this.direccion, 10, 500, 'Dirección');
  }
}

export class ObtenerVisitaDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}

export class ListarVisitasDTO {
  constructor(
    public page: number = 1,
    public pageSize: number = 10,
    public estado?: string,
    public programaId?: string,
    public postulanteId?: string,
    public inspectorId?: string
  ) {
    if (page < 1) throw new Error('Página debe ser mayor a 0');
    if (pageSize < 1) throw new Error('Tamaño de página debe ser mayor a 0');
  }
}

export class IniciarVisitaDTO {
  constructor(public id: string, public inspectorId: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(inspectorId, 'Inspector ID');
  }
}

export class CompletarVisitaDTO {
  constructor(
    public id: string,
    public calificacion: number,
    public observaciones?: string,
    public fotosUrl?: string
  ) {
    validateNotEmpty(id, 'ID');
    if (calificacion < 0 || calificacion > 100) {
      throw new Error('Calificación debe estar entre 0 y 100');
    }
  }
}

export class CancelarVisitaDTO {
  constructor(public id: string, public motivo: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(motivo, 'Motivo');
    validateLength(motivo, 10, 500, 'Motivo');
  }
}
