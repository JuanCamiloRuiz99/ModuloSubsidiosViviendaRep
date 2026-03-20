/**
 * Puerto para Repositorio de Programas
 */

import { Programa } from './programa';

export interface ProgramaRepository {
  create(programa: Programa): Promise<Programa>;
  update(programa: Programa): Promise<Programa>;
  cambiarEstado(id: string, nuevoEstado: string): Promise<Programa>;
  findById(id: string): Promise<Programa | null>;
  findAll(criteria: any): Promise<{ items: Programa[]; total: number }>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
