/**
 * Value Objects para Programas
 */

export class CodigoPrograma {
  constructor(public readonly value: string) {
    if (!value || value.length < 3 || value.length > 20) {
      throw new Error('Código debe tener entre 3 y 20 caracteres');
    }
  }

  public equals(other: CodigoPrograma): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

export class EstadoProgramaVO {
  private static readonly ESTADOS_VALIDOS = ['BORRADOR', 'ACTIVO', 'INHABILITADO', 'CULMINADO'];

  constructor(public readonly value: string) {
    if (!EstadoProgramaVO.ESTADOS_VALIDOS.includes(value)) {
      throw new Error(`Estado inválido: ${value}`);
    }
  }

  public equals(other: EstadoProgramaVO): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
