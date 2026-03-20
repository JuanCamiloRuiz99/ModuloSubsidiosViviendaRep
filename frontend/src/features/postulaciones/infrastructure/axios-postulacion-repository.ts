/**
 * Repositorio Axios para Postulaciones
 */

import axios from 'axios';
import { Postulacion } from '../../domain/postulacion';
import { PostulacionRepository } from '../../domain/postulacion-repository';
import { PostulacionMapper } from './postulacion-mapper';

const API_URL = '/api';

export class AxiosPostulacionRepository implements PostulacionRepository {
  async create(postulacion: Postulacion): Promise<Postulacion> {
    const response = await axios.post(`${API_URL}/postulaciones/crear/`, {
      numeroDocumento: postulacion.numeroDocumento,
      nombre: postulacion.nombre,
      apellido: postulacion.apellido,
      email: postulacion.email,
      telefono: postulacion.telefono,
      direccion: postulacion.direccion,
      programaId: postulacion.programaId,
    });
    return PostulacionMapper.toDomain(response.data);
  }

  async update(postulacion: Postulacion): Promise<Postulacion> {
    const response = await axios.put(
      `${API_URL}/postulaciones/${postulacion.id}/`,
      PostulacionMapper.toPersistence(postulacion)
    );
    return PostulacionMapper.toDomain(response.data);
  }

  async findById(id: string): Promise<Postulacion | null> {
    try {
      const response = await axios.get(`${API_URL}/postulaciones/${id}/obtener/`);
      return PostulacionMapper.toDomain(response.data);
    } catch (error) {
      return null;
    }
  }

  async findByProgramaId(programaId: string): Promise<Postulacion[]> {
    const response = await axios.get(`${API_URL}/postulaciones/listar/`, {
      params: { programaId },
    });
    return response.data.items.map((item: any) => PostulacionMapper.toDomain(item));
  }

  async findAll(criteria: any): Promise<{ items: Postulacion[]; total: number }> {
    const response = await axios.get(`${API_URL}/postulaciones/listar/`, {
      params: criteria,
    });
    return {
      items: response.data.items.map((item: any) => PostulacionMapper.toDomain(item)),
      total: response.data.total,
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/postulaciones/${id}/`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await axios.get(`${API_URL}/postulaciones/listar/`, {
      params: { pageSize: 1 },
    });
    return response.data.total;
  }
}
