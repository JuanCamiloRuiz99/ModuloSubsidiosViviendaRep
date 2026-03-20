/**
 * Value Objects para Auditoria
 */

export class TipoAccionVO {
  private static readonly ACCIONES_VALIDAS = ['CREAR', 'ACTUALIZAR', 'ELIMINAR'];
  value: string;

  constructor(value: string) {
    this.value = value;
    if (!TipoAccionVO.ACCIONES_VALIDAS.includes(value)) {
      throw new Error(`Acción inválida: ${value}`);
    }
  }

  equals(other: TipoAccionVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class CambiosAuditoria {
  cambios: Record<string, any>;

  constructor(cambios: Record<string, any>) {
    this.cambios = cambios;
    if (!cambios || Object.keys(cambios).length === 0) {
      throw new Error('Cambios debe contener al menos un campo');
    }
  }

  obtenerCamposModificados(): string[] {
    return Object.keys(this.cambios);
  }

  obtenerValorAnterior(campo: string): any {
    return this.cambios[campo]?.anterior;
  }

  obtenerValorNuevo(campo: string): any {
    return this.cambios[campo]?.nuevo;
  }

  public equals(other: CambiosAuditoria): boolean {
    return JSON.stringify(this.cambios) === JSON.stringify(other.cambios);
  }

  public toString(): string {
    return JSON.stringify(this.cambios);
  }
}
