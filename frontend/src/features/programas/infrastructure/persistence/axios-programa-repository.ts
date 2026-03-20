/**
 * Implementación del Repositorio usando apiService
 */

import apiService from '../../../../core/services/api.service';
import { Programa } from '../../domain';
import type { ProgramaRepository } from '../../domain';
import { ProgramaMapper } from '../mappers/programa-mapper';

export class AxiosProgramaRepository implements ProgramaRepository {
  async create(programa: Programa): Promise<Programa> {
    const props = programa.toPrimitives();
    const { data } = await apiService.post<any>('programas/', {
      nombre: props.nombre,
      descripcion: props.descripcion,
      entidad_responsable: props.entidadResponsable,
      codigo_programa: props.codigoPrograma,
      estado: props.estado,
    });
    return ProgramaMapper.toProgramaEntity(data);
  }

  async update(programa: Programa): Promise<Programa> {
    const props = programa.toPrimitives();
    const { data } = await apiService.patch<any>(`programas/${props.id}/`, {
      nombre: props.nombre,
      descripcion: props.descripcion,
      entidad_responsable: props.entidadResponsable,
      estado: props.estado,
    });
    return ProgramaMapper.toProgramaEntity(data);
  }

  async findById(id: string): Promise<Programa | null> {
    try {
      const { data } = await apiService.get<any>(`programas/${id}/`);
      return ProgramaMapper.toProgramaEntity(data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async findAll(criteria?: any): Promise<{ items: Programa[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const params: Record<string, any> = {};
    if (criteria?.estado) params.estado = criteria.estado;
    if (criteria?.page) params.page = criteria.page;
    if (criteria?.pageSize) params.page_size = criteria.pageSize;

    const { data } = await apiService.get<any>('programas/', { params });
    const items = (data.results as any[]).map((item) => ProgramaMapper.toProgramaEntity(item));
    const pageSize = criteria?.pageSize ?? 10;
    return {
      items,
      total: data.count,
      page: criteria?.page ?? 1,
      pageSize,
      totalPages: Math.ceil(data.count / pageSize),
    };
  }

  async cambiarEstado(id: string, nuevoEstado: string): Promise<Programa> {
    const { data } = await apiService.post<any>(`programas/${id}/cambiar_estado/`, { nuevo_estado: nuevoEstado });
    return ProgramaMapper.toProgramaEntity(data.programa ?? data);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiService.delete(`programas/${id}/`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) return false;
      throw error;
    }
  }

  async count(): Promise<number> {
    const result = await this.findAll();
    return result.total;
  }
}
