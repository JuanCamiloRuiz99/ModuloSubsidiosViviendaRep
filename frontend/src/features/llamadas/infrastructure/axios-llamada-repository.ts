/**
 * Repositorio Axios para Llamadas a Postulantes.
 */

import apiService from '../../../core/services/api.service';

// ── Types ─────────────────────────────────────────────────────────────────── //

export interface LlamadaItem {
  id: number;
  postulacion: number;
  usuario_llamada: number;
  usuario_nombre: string;
  fecha_llamada: string;
  hora_llamada: string;
  resultado: string;
  observaciones: string;
  fecha_registro: string;
  activo_logico: boolean;
}

export interface CrearLlamadaPayload {
  postulacion: number;
  usuario_llamada: number;
  fecha_llamada: string;
  hora_llamada: string;
  resultado: string;
  observaciones?: string;
}

// ── Repository ────────────────────────────────────────────────────────────── //

const BASE = 'llamadas/';

export const llamadaRepository = {
  async listar(params?: Record<string, string | number>): Promise<LlamadaItem[]> {
    const { data } = await apiService.get<any>(BASE, { params });
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  async obtener(id: number): Promise<LlamadaItem> {
    const { data } = await apiService.get<LlamadaItem>(`${BASE}${id}/`);
    return data;
  },

  async crear(payload: CrearLlamadaPayload): Promise<LlamadaItem> {
    const { data } = await apiService.post<LlamadaItem>(BASE, payload);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiService.delete(`${BASE}${id}/`);
  },
};
