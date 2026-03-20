/**
 * DTOs de entrada para Usuarios
 */

import {
  validateEmail,
  validateLength,
  validateNotEmpty,
} from '../../../../shared/application/validators';

export class CrearUsuarioDTO {
  constructor(
    public nombre: string,
    public apellido: string,
    public email: string,
    public numeroDocumento: string,
    public idRol: number,
    public contrasena: string,
    public centroAtencion?: string,
    public telefono?: string
  ) {
    this.validate();
  }

  private validate(): void {
    validateNotEmpty(this.nombre, 'Nombre');
    validateLength(this.nombre, 3, 100, 'Nombre');
    validateNotEmpty(this.apellido, 'Apellido');
    validateLength(this.apellido, 3, 100, 'Apellido');
    validateEmail(this.email);
    validateNotEmpty(this.numeroDocumento, 'Número de documento');
    validateNotEmpty(String(this.idRol), 'Rol');
    validateNotEmpty(this.contrasena, 'Contraseña');
    validateLength(this.contrasena, 8, 50, 'Contraseña');
  }
}

export class ObtenerUsuarioDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}

export class ActualizarUsuarioDTO {
  constructor(
    public id: string,
    public nombre?: string,
    public apellido?: string,
    public email?: string,
    public numeroDocumento?: string,
    public idRol?: number,
    public centroAtencion?: string,
    public telefono?: string
  ) {
    validateNotEmpty(id, 'ID');
  }
}

export class ListarUsuariosDTO {
  constructor(
    public page: number = 1,
    public pageSize: number = 10,
    public search?: string,
    public rol?: string,
    public estado?: string,
    public centroAtencion?: string
  ) {
    if (page < 1) throw new Error('Página debe ser mayor a 0');
    if (pageSize < 1) throw new Error('Tamaño de página debe ser mayor a 0');
  }
}

export class CambiarRolDTO {
  constructor(public id: string, public nuevoRol: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(nuevoRol, 'Nuevo rol');
  }
}

export class CambiarEstadoDTO {
  constructor(public id: string, public nuevoEstado: string) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(nuevoEstado, 'Nuevo estado');
  }
}

export class CambiarContrasenaDTO {
  constructor(
    public id: string,
    public contrasenaActual: string,
    public nuevaContrasena: string
  ) {
    validateNotEmpty(id, 'ID');
    validateNotEmpty(contrasenaActual, 'Contraseña actual');
    validateNotEmpty(nuevaContrasena, 'Nueva contraseña');
    validateLength(nuevaContrasena, 8, 50, 'Nueva contraseña');
  }
}

export class ActivarUsuarioDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}

export class DesactivarUsuarioDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}

export class BloquearUsuarioDTO {
  constructor(public id: string) {
    validateNotEmpty(id, 'ID');
  }
}
