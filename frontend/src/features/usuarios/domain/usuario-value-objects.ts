/**
 * Value Objects para Usuarios
 */

export class Email {
  constructor(public readonly value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Email inválido');
    }
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

export class RolUsuarioVO {
  private static readonly ROLES_VALIDOS = [1, 2, 3]; // IDs numéricos del backend

  constructor(public readonly value: number) {
    if (!RolUsuarioVO.ROLES_VALIDOS.includes(value)) {
      throw new Error(`Rol inválido: ${value}`);
    }
  }

  public equals(other: RolUsuarioVO): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}

export class EstadoUsuarioVO {
  private static readonly ESTADOS_VALIDOS = [
    'activo',
    'inactivo',
  ];

  constructor(public readonly value: string) {
    if (!EstadoUsuarioVO.ESTADOS_VALIDOS.includes(value)) {
      throw new Error(`Estado inválido: ${value}`);
    }
  }

  public equals(other: EstadoUsuarioVO): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
