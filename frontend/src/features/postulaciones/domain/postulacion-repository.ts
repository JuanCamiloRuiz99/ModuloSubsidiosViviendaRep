/**
 * Puerto para Repositorio de Postulaciones
 */

import { Postulacion } from './postulacion';

export interface PostulacionRepository {
  create(postulacion: Postulacion): Promise<Postulacion>;
  update(postulacion: Postulacion): Promise<Postulacion>;
  findById(id: string): Promise<Postulacion | null>;
  findByProgramaId(programaId: string): Promise<Postulacion[]>;
  findAll(criteria: any): Promise<{ items: Postulacion[]; total: number }>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
