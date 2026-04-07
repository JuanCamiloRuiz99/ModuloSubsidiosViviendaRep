/**
 * useLlamadas – hooks para el módulo de llamadas a postulantes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  llamadaRepository,
  type LlamadaItem,
  type CrearLlamadaPayload,
} from '../../infrastructure/axios-llamada-repository';

// ── Hook: listar llamadas (opcionalmente filtradas por postulación) ─────── //

export function useLlamadas(postulacionId?: number) {
  const params: Record<string, string | number> = {};
  if (postulacionId) params.postulacion = postulacionId;

  const { data, isLoading, error } = useQuery<LlamadaItem[]>({
    queryKey: ['llamadas', postulacionId ?? 'all'],
    queryFn: () => llamadaRepository.listar(params),
  });

  return {
    llamadas: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}

// ── Hook: crear llamada ─────────────────────────────────────────────────── //

export function useCrearLlamada() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrearLlamadaPayload) => llamadaRepository.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['llamadas'] });
    },
  });
}

// ── Hook: eliminar llamada ──────────────────────────────────────────────── //

export function useEliminarLlamada() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => llamadaRepository.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['llamadas'] });
    },
  });
}
