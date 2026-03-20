/**
 * Entidad de Dominio: Usuario
 */

import { BaseEntity } from '../../../shared/domain/base-entity';

export enum RolUsuario {
  ADMIN = 1,
  FUNCIONARIO = 2,
  TECNICO_VISITANTE = 3,
}

export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export class Usuario extends BaseEntity {
  constructor(
    id: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public numeroDocumento: string,
    public idRol: number,
    public estado: EstadoUsuario,
    public centroAtencion?: string,
    public telefono?: string,
    public ultimoAcceso?: Date,
    public intentosFallidos?: number,
    public requiereResetContrasena?: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public cambiarRol(nuevoRol: number): void {
    this.idRol = nuevoRol;
    this.updatedAt = new Date();
  }

  public cambiarEstado(nuevoEstado: EstadoUsuario): void {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  public activar(): void {
    if (this.estado === EstadoUsuario.ACTIVO) {
      throw new Error('Usuario ya está activo');
    }
    this.estado = EstadoUsuario.ACTIVO;
    this.intentosFallidos = 0;
    this.updatedAt = new Date();
  }

  public desactivar(): void {
    if (this.estado === EstadoUsuario.INACTIVO) {
      throw new Error('Usuario ya está inactivo');
    }
    this.estado = EstadoUsuario.INACTIVO;
    this.updatedAt = new Date();
  }

  public bloquear(): void {
    this.estado = EstadoUsuario.INACTIVO;  // Map BLOQUEADO state to INACTIVO
    this.updatedAt = new Date();
  }

  public incrementarIntentosFallidos(): void {
    this.intentosFallidos = (this.intentosFallidos || 0) + 1;
    if (this.intentosFallidos >= 5) {
      this.bloquear();
    }
  }

  public resetearIntentosFallidos(): void {
    this.intentosFallidos = 0;
    this.ultimoAcceso = new Date();
  }

  public requiereReset(): void {
    this.requiereResetContrasena = true;
    this.updatedAt = new Date();
  }

  public esAdministrador(): boolean {
    return this.idRol === RolUsuario.ADMIN;
  }

  public esFuncionario(): boolean {
    return this.idRol === RolUsuario.FUNCIONARIO;
  }

  public esTecnicoVisitante(): boolean {
    return this.idRol === RolUsuario.TECNICO_VISITANTE;
  }

  public esActivo(): boolean {
    return this.estado === EstadoUsuario.ACTIVO;
  }

  public toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      numeroDocumento: this.numeroDocumento,
      idRol: this.idRol,
      estado: this.estado,
      centroAtencion: this.centroAtencion,
      telefono: this.telefono,
      ultimoAcceso: this.ultimoAcceso,
      intentosFallidos: this.intentosFallidos,
      requiereResetContrasena: this.requiereResetContrasena,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromPrimitives(data: any): Usuario {
    return new Usuario(
      data.id,
      data.nombres,
      data.apellidos,
      data.email,
      data.numeroDocumento,
      data.rol,
      data.estado,
      data.centroAtencion,
      data.telefono,
      data.ultimoAcceso,
      data.intentosFallidos,
      data.requiereResetContrasena,
      data.createdAt,
      data.updatedAt
    );
  }
}
