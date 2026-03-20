/**
 * Mapper para Auditoria
 */

import { Auditoria } from '../../domain/auditoria';

export class AuditoriaMapper {
  static toPersistence(auditoria: Auditoria): any {
    return auditoria.toPrimitives();
  }

  static toDomain(raw: any): Auditoria {
    return Auditoria.fromPrimitives(raw);
  }
}
