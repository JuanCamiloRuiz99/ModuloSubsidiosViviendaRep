/**
 * Value Objects para Postulaciones
 */

export class NumeroDocumento {
  constructor(public readonly value: string) {
    if (!value || value.length < 5 || value.length > 20) {
      throw new Error('Número de documento inválido');
    }
  }

  public equals(other: NumeroDocumento): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}

export class Puntaje {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Puntaje debe estar entre 0 y 100');
    }
  }

  public esAprobado(minimo: number = 60): boolean {
    return this.value >= minimo;
  }

  public equals(other: Puntaje): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}

export class EstadoPostulacionVO {
  private static readonly ESTADOS_VALIDOS = [
    'REGISTRADA',
    'REVISADA',
    'APROBADA',
    'RECHAZADA',
    'ANULADA',
  ];

  constructor(public readonly value: string) {
    if (!EstadoPostulacionVO.ESTADOS_VALIDOS.includes(value)) {
      throw new Error(`Estado inválido: ${value}`);
    }
  }

  public equals(other: EstadoPostulacionVO): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
