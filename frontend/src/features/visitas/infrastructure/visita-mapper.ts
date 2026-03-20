/**
 * Mapper para Visitas
 */

import { Visita } from '../domain/visita';

export class VisitaMapper {
  static toPersistence(visita: Visita): any {
    return visita.toPrimitives();
  }

  static toDomain(raw: any): Visita {
    return Visita.fromPrimitives(raw);
  }
}
