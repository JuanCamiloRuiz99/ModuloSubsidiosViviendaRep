/**
 * Puerto para Repositorio de Auditoria
 */

import { Auditoria } from './auditoria';

export interface AuditoriaRepository {
  create(auditoria: Auditoria): Promise<Auditoria>;
  findById(id: string): Promise<Auditoria | null>;
  findByEntidadId(entidadId: string): Promise<Auditoria[]>;
  findByUsuarioId(usuarioId: string): Promise<Auditoria[]>;
  findAll(criteria: any): Promise<{ items: Auditoria[]; total: number }>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
