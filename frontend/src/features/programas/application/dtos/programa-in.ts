/**
 * DTOs de entrada para el módulo Programas
 * 
 * Define la estructura de datos esperados desde la presentación
 */

import { validateNotEmpty, validateLength } from '../../../../shared/validators';

/**
 * DTO para crear un nuevo programa
 */
export class CrearProgramaDTO {
  nombre: string;
  descripcion: string;
  entidadResponsable: string;

  constructor(
    nombre: string,
    descripcion: string,
    entidadResponsable: string
  ) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.entidadResponsable = entidadResponsable;
    this.validar();
  }

  private validar(): void {
    validateNotEmpty(this.nombre, 'Nombre');
    validateLength(this.nombre, 3, 200, 'Nombre');
    
    validateNotEmpty(this.descripcion, 'Descripción');
    validateLength(this.descripcion, 10, 2000, 'Descripción');
    
    validateNotEmpty(this.entidadResponsable, 'Entidad responsable');
  }
}

/**
 * DTO para actualizar un programa
 */
export class ActualizarProgramaDTO {
  id: string;
  nombre: string;
  descripcion: string;
  entidadResponsable: string;

  constructor(
    id: string,
    nombre: string,
    descripcion: string,
    entidadResponsable: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.entidadResponsable = entidadResponsable;
    this.validar();
  }

  private validar(): void {
    validateNotEmpty(this.id, 'ID');
    validateNotEmpty(this.nombre, 'Nombre');
    validateLength(this.nombre, 3, 200, 'Nombre');
    
    validateNotEmpty(this.descripcion, 'Descripción');
    validateLength(
      this.descripcion,
      10,
      2000,
      'Descripción'
    );
    
    validateNotEmpty(this.entidadResponsable, 'Entidad responsable');
  }
}

/**
 * DTO para cambiar estado de un programa
 */
export class CambiarEstadoProgramaDTO {
  id: string;
  nuevoEstado: string;

  constructor(
    id: string,
    nuevoEstado: string
  ) {
    this.id = id;
    this.nuevoEstado = nuevoEstado;
    this.validar();
  }

  private validar(): void {
    validateNotEmpty(this.id, 'ID');
    validateNotEmpty(this.nuevoEstado, 'Nuevo estado');
  }
}

/**
 * DTO para obtener un programa
 */
export class ObtenerProgramaDTO {
  id: string;

  constructor(id: string) {
    this.id = id;
    validateNotEmpty(this.id, 'ID');
  }
}

/**
 * DTO para listar programas con filtros
 */
export class ListarProgramasDTO {
  page: number;
  pageSize: number;
  estado?: string;
  busqueda?: string;
  ordenar?: string;

  constructor(
    page: number = 1,
    pageSize: number = 10,
    estado?: string,
    busqueda?: string,
    ordenar?: string
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.estado = estado;
    this.busqueda = busqueda;
    this.ordenar = ordenar;
    this.validar();
  }

  private validar(): void {
    if (this.page < 1) {
      throw new Error('Página debe ser mayor a 0');
    }
    if (this.pageSize < 1) {
      throw new Error('Tamaño de página debe ser mayor a 0');
    }
  }
}

/**
 * DTO para eliminar un programa
 */
export class EliminarProgramaDTO {
  id: string;

  constructor(id: string) {
    this.id = id;
    validateNotEmpty(this.id, 'ID');
  }
}
