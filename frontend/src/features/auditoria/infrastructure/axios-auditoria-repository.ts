/**
 * Repositorio Axios para Auditoria
 */

import axios from 'axios';
import { Auditoria } from '../../domain/auditoria';
import { AuditoriaRepository } from '../../domain/auditoria-repository';
import { AuditoriaMapper } from './auditoria-mapper';

const API_URL = '/api';

export class AxiosAuditoriaRepository implements AuditoriaRepository {
  async create(auditoria: Auditoria): Promise<Auditoria> {
    const response = await axios.post(`${API_URL}/auditoria/crear/`, {
      tipoAccion: auditoria.tipoAccion,
      entidad: auditoria.entidad,
      entidadId: auditoria.entidadId,
      usuarioId: auditoria.usuarioId,
      numeroDocumento: auditoria.numeroDocumento,
      cambios: auditoria.cambios,
      detalles: auditoria.detalles,
    });
    return AuditoriaMapper.toDomain(response.data);
  }

  async findById(id: string): Promise<Auditoria | null> {
    try {
      const response = await axios.get(`${API_URL}/auditoria/${id}/obtener/`);
      return AuditoriaMapper.toDomain(response.data);
    } catch (error) {
      return null;
    }
  }

  async findByEntidadId(entidadId: string): Promise<Auditoria[]> {
    const response = await axios.get(`${API_URL}/auditoria/listar/`, {
      params: { entidadId },
    });
    return response.data.items.map((item: any) => AuditoriaMapper.toDomain(item));
  }

  async findByUsuarioId(usuarioId: string): Promise<Auditoria[]> {
    const response = await axios.get(`${API_URL}/auditoria/listar/`, {
      params: { usuarioId },
    });
    return response.data.items.map((item: any) => AuditoriaMapper.toDomain(item));
  }

  async findAll(criteria: any): Promise<{ items: Auditoria[]; total: number }> {
    const response = await axios.get(`${API_URL}/auditoria/listar/`, {
      params: criteria,
    });
    return {
      items: response.data.items.map((item: any) => AuditoriaMapper.toDomain(item)),
      total: response.data.total,
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/auditoria/${id}/`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await axios.get(`${API_URL}/auditoria/listar/`, {
      params: { pageSize: 1 },
    });
    return response.data.total;
  }
}
