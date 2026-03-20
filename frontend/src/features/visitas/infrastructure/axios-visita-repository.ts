/**
 * Repositorio Axios para Visitas.
 *
 * Usa apiService (instancia compartida de axios con interceptores de auth
 * y baseURL configurada) en lugar de axios crudo.
 */

import axios from 'axios';
import { apiService } from '../../../core/services';
import { Visita } from '../domain/visita';
import { VisitaRepository } from '../domain/visita-repository';
import { VisitaMapper } from './visita-mapper';

export class AxiosVisitaRepository implements VisitaRepository {
  async create(visita: Visita): Promise<Visita> {
    const response = await apiService.post('/visitas/crear/', {
      postulacionId: visita.postulacionId,
      postulanteId: visita.postulanteId,
      programaId: visita.programaId,
      tipoVisita: visita.tipoVisita,
      direccion: visita.direccion,
      fechaProgramada: visita.fechaProgramada,
      inspectorId: visita.inspectorId,
    });
    return VisitaMapper.toDomain(response.data);
  }

  async update(visita: Visita): Promise<Visita> {
    const response = await apiService.put(
      `/visitas/${visita.id}/`,
      VisitaMapper.toPersistence(visita)
    );
    return VisitaMapper.toDomain(response.data);
  }

  async findById(id: string): Promise<Visita | null> {
    try {
      const response = await apiService.get(`/visitas/${id}/obtener/`);
      return VisitaMapper.toDomain(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByPostulacionId(postulacionId: string): Promise<Visita[]> {
    const response = await apiService.get('/visitas/listar/', {
      params: { postulacionId },
    });
    return response.data.items.map((item: any) => VisitaMapper.toDomain(item));
  }

  async findByProgramaId(programaId: string): Promise<Visita[]> {
    const response = await apiService.get('/visitas/listar/', {
      params: { programaId },
    });
    return response.data.items.map((item: any) => VisitaMapper.toDomain(item));
  }

  async findAll(criteria: any): Promise<{ items: Visita[]; total: number }> {
    const response = await apiService.get('/visitas/listar/', {
      params: criteria,
    });
    return {
      items: response.data.items.map((item: any) => VisitaMapper.toDomain(item)),
      total: response.data.total,
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiService.delete(`/visitas/${id}/`);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async count(): Promise<number> {
    const response = await apiService.get('/visitas/listar/', {
      params: { pageSize: 1 },
    });
    return response.data.total;
  }
}
