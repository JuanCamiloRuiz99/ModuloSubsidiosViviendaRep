/**
 * useDistribuirPostulaciones – hooks para la distribución equitativa
 * de postulaciones entre funcionarios.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../../../core/services';

// ── Tipos ────────────────────────────────────────────────────────────────── //

export interface FuncionarioActivo {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
}

export interface GrupoDistribucion {
  funcionario_id: number;
  funcionario_nombre: string;
  cantidad: number;
  postulacion_ids: number[];
}

export interface DistribucionResult {
  total_distribuidas: number;
  grupos: GrupoDistribucion[];
}

interface DistribuirPayload {
  num_grupos: number;
  funcionario_ids: number[];
  postulacion_ids?: number[];
}

// ── Hook: lista de funcionarios activos ──────────────────────────────────── //

export function useFuncionariosActivos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['funcionarios-activos-postulaciones'],
    queryFn: () =>
      apiService
        .get<FuncionarioActivo[]>('postulaciones/funcionarios-activos/')
        .then((r) => r.data),
  });

  return {
    funcionarios: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}

// ── Hook: distribuir postulaciones ───────────────────────────────────────── //

export function useDistribuirPostulaciones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DistribuirPayload) =>
      apiService
        .post<DistribucionResult>('postulaciones/distribuir/', payload)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['postulantes-registro-hogar'] });
    },
  });
}

// ── Hook: asignar postulación individual ─────────────────────────────────── //

interface AsignarIndividualPayload {
  postulacion_id: number;
  funcionario_id: number;
}

export interface AsignarIndividualResult {
  detail: string;
  postulacion_id: number;
  funcionario_id: number;
  funcionario_nombre: string;
}

export function useAsignarIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AsignarIndividualPayload) =>
      apiService
        .post<AsignarIndividualResult>('postulaciones/asignar-individual/', payload)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['postulantes-registro-hogar'] });
    },
  });
}
