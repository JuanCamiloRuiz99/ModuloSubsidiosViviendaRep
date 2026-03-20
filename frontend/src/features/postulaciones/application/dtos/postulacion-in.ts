/**
 * DTOs de entrada para Postulaciones
 */

import { validateEmail, validateLength, validateNotEmpty } from '../../../shared/application/validators';

export class CrearPostulacionDTO {
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  programaId: string;

  constructor(
    numeroDocumento: string,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    direccion: string,
    programaId: string
  ) {
    this.numeroDocumento = numeroDocumento;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.direccion = direccion;
    this.programaId = programaId;
    this.validate();
  }

  private validate(): void {
    validateNotEmpty(this.numeroDocumento, 'Número de documento');
    validateNotEmpty(this.nombre, 'Nombre');
    validateLength(this.nombre, 3, 100, 'Nombre');
    validateNotEmpty(this.apellido, 'Apellido');
    validateLength(this.apellido, 3, 100, 'Apellido');
    validateEmail(this.email);
    validateNotEmpty(this.telefono, 'Teléfono');
    validateNotEmpty(this.direccion, 'Dirección');
    validateNotEmpty(this.programaId, 'Programa ID');
  }
}

export class ObtenerPostulacionDTO {
  id: string;

  constructor(id: string) {
    this.id = id;
    validateNotEmpty(id, 'ID');
  }
}

export class ListarPostulacionesDTO {
  page: number;
  pageSize: number;
  estado?: string;
  programaId?: string;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    estado?: string,
    programaId?: string
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.estado = estado;
    this.programaId = programaId;
    if (page < 1) throw new Error('Página debe ser mayor a 0');
    if (pageSize < 1) throw new Error('Tamaño de página debe ser mayor a 0');
  }
}

export class RevisarPostulacionDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}

export class AprobarPostulacionDTO {
  constructor(public id: string, public puntaje: number) {
    validateNotEmpty(id, 'ID');
    if (puntaje < 0 || puntaje > 100) {
      throw new Error('Puntaje debe estar entre 0 y 100');
    }
  }
}

export class RechazarPostulacionDTO {
  constructor(public id: string, public motivo: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(motivo, 'Motivo');
    validateLength(motivo, 10, 500, 'Motivo');
  }
}

export class AnularPostulacionDTO {
  constructor(public id: string, public motivo: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(motivo, 'Motivo');
    validateLength(motivo, 10, 500, 'Motivo');
  }
}
