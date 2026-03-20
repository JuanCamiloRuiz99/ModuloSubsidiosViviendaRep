/**
 * Puerto para Repositorio de Usuarios
 */

import { Usuario } from './usuario';

export interface UsuarioRepository {
  create(usuario: Usuario, password?: string): Promise<Usuario>;
  update(usuario: Usuario): Promise<Usuario>;
  cambiarEstado(id: string, nuevoEstado: 'activo' | 'inactivo'): Promise<Usuario>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(criteria: any): Promise<{ items: Usuario[]; total: number; stats?: Record<string, number> }>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  findByRol(rol: number): Promise<Usuario[]>;
}
