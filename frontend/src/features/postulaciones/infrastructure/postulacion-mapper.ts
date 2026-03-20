/**
 * Mapper para Postulaciones
 */

import { Postulacion } from '../../domain/postulacion';

export class PostulacionMapper {
  static toPersistence(postulacion: Postulacion): any {
    return postulacion.toPrimitives();
  }

  static toDomain(raw: any): Postulacion {
    return Postulacion.fromPrimitives(raw);
  }
}
