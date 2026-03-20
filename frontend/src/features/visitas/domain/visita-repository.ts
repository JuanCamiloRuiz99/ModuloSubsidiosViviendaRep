/**
 * Puerto para Repositorio de Visitas
 */

import { Visita } from './visita';

export interface VisitaRepository {
  create(visita: Visita): Promise<Visita>;
  update(visita: Visita): Promise<Visita>;
  findById(id: string): Promise<Visita | null>;
  findByPostulacionId(postulacionId: string): Promise<Visita[]>;
  findByProgramaId(programaId: string): Promise<Visita[]>;
  findAll(criteria: any): Promise<{ items: Visita[]; total: number }>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
