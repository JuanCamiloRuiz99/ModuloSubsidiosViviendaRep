/**
 * DTOs de salida para Postulaciones
 */

import { Postulacion } from '../../domain/postulacion';

export class PostulacionDTO {
  id: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  programaId: string;
  estado: string;
  puntaje: number;
  motivo?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    numeroDocumento: string,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    direccion: string,
    programaId: string,
    estado: string,
    puntaje: number,
    motivo?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.numeroDocumento = numeroDocumento;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.direccion = direccion;
    this.programaId = programaId;
    this.estado = estado;
    this.puntaje = puntaje;
    this.motivo = motivo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDomain(post: Postulacion): PostulacionDTO {
    return new PostulacionDTO(
      post.id,
      post.numeroDocumento,
      post.nombre,
      post.apellido,
      post.email,
      post.telefono,
      post.direccion,
      post.programaId,
      post.estado,
      post.puntaje,
      post.motivo,
      post.createdAt,
      post.updatedAt
    );
  }
}

export class ListaPostulacionesDTO {
  constructor(
    public items: PostulacionDTO[],
    public total: number,
    public page: number,
    public pageSize: number,
    public totalPages: number
  ) {}

  static fromData(data: any): ListaPostulacionesDTO {
    return new ListaPostulacionesDTO(
      data.items.map((item: any) => new PostulacionDTO(
        item.id,
        item.numeroDocumento,
        item.nombre,
        item.apellido,
        item.email,
        item.telefono,
        item.direccion,
        item.programaId,
        item.estado,
        item.puntaje,
        item.motivo,
        item.createdAt,
        item.updatedAt
      )),
      data.total,
      data.page,
      data.pageSize,
      data.totalPages
    );
  }
}

export class EstadisticasPostulacionesDTO {
  constructor(
    public total: number,
    public registradas: number,
    public revisadas: number,
    public aprobadas: number,
    public rechazadas: number,
    public anuladas: number
  ) {}

  static fromData(data: any): EstadisticasPostulacionesDTO {
    return new EstadisticasPostulacionesDTO(
      data.total,
      data.registradas,
      data.revisadas,
      data.aprobadas,
      data.rechazadas,
      data.anuladas
    );
  }
}
