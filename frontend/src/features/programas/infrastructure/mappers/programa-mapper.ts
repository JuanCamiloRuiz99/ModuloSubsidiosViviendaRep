/**
 * Mapeador de Programa
 * 
 * Convierte entre entidades de dominio, DTOs HTTP y datos raw
 */

import { Programa } from '../../domain';

export class ProgramaMapper {
  /**
   * Convierte HTTP response a entidad Programa
   */
  static toProgramaEntity(raw: any): Programa {
    return new Programa(
      String(raw.id),
      raw.nombre,
      raw.descripcion,
      raw.entidad_responsable || raw.entidadResponsable,
      raw.codigo_programa || raw.codigoPrograma,
      raw.estado
    );
  }}