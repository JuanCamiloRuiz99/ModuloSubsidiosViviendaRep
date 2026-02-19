/**
 * Servicio de Programas - API
 * Define todas las operaciones CRUD para programas
 */

import { apiClient } from './client';
import type { Programa } from '../../domain/programas/programa.model';

export interface CreateProgramaRequest {
  nombre: string;
  descripcion: string;
  entidad_responsable: string;
}

export interface UpdateProgramaRequest extends Partial<CreateProgramaRequest> {
  estado?: 'BORRADOR' | 'ACTIVO' | 'INHABILITADO';
}

export interface ProgramaResponse extends Programa {
  id: number;
  codigo_programa: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProgramaStatistics {
  total: number;
  por_estado: {
    BORRADOR: number;
    ACTIVO: number;
    INHABILITADO: number;
  };
}

/**
 * Obtener todos los programas
 * @param estado - Filtrar por estado (opcional)
 * @param page - Número de página (opcional)
 * @returns Lista de programas
 */
export const getProgramas = async (
  estado?: string,
  page: number = 1
): Promise<{ results: ProgramaResponse[]; count: number; next: string | null }> => {
  let endpoint = '/programas/?page=' + page;
  if (estado) {
    endpoint += `&estado=${estado}`;
  }

  const response = await apiClient(endpoint, {
    method: 'GET',
  });

  return response.json();
};

/**
 * Obtener un programa específico por ID
 * @param id - ID del programa
 * @returns Datos del programa
 */
export const getPrograma = async (id: number): Promise<ProgramaResponse> => {
  const response = await apiClient(`/programas/${id}/`, {
    method: 'GET',
  });

  return response.json();
};

/**
 * Crear un nuevo programa
 * @param data - Datos del programa
 * @returns Programa creado
 */
export const createPrograma = async (
  data: CreateProgramaRequest
): Promise<ProgramaResponse> => {
  const response = await apiClient('/programas/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
};

/**
 * Actualizar un programa existente
 * @param id - ID del programa
 * @param data - Datos a actualizar
 * @returns Programa actualizado
 */
export const updatePrograma = async (
  id: number,
  data: UpdateProgramaRequest
): Promise<ProgramaResponse> => {
  const response = await apiClient(`/programas/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.json();
};

/**
 * Actualizar parcialmente un programa
 * @param id - ID del programa
 * @param data - Datos parciales a actualizar
 * @returns Programa actualizado
 */
export const partialUpdatePrograma = async (
  id: number,
  data: Partial<UpdateProgramaRequest>
): Promise<ProgramaResponse> => {
  const response = await apiClient(`/programas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  return response.json();
};

/**
 * Eliminar un programa
 * @param id - ID del programa
 */
export const deletePrograma = async (id: number): Promise<void> => {
  await apiClient(`/programas/${id}/`, {
    method: 'DELETE',
  });
};

/**
 * Cambiar el estado de un programa
 * @param id - ID del programa
 * @param nuevoEstado - Nuevo estado del programa
 * @returns Programa actualizado
 */
export const cambiarEstadoPrograma = async (
  id: number,
  nuevoEstado: 'BORRADOR' | 'ACTIVO' | 'INHABILITADO'
): Promise<{ mensaje: string; programa: ProgramaResponse }> => {
  const response = await apiClient(`/programas/${id}/cambiar_estado/`, {
    method: 'POST',
    body: JSON.stringify({ nuevo_estado: nuevoEstado }),
  });

  return response.json();
};

/**
 * Obtener estadísticas de programas
 * @returns Estadísticas por estado
 */
export const getProgramasStatistics = async (): Promise<ProgramaStatistics> => {
  const response = await apiClient('/programas/estadisticas/', {
    method: 'GET',
  });

  return response.json();
};
