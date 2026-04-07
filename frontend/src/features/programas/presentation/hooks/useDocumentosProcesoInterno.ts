/**
 * useDocumentosProcesoInterno — Hook para listar, subir y eliminar
 * documentos del proceso interno (Etapa 3 – Gestión Documental).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  documentoProcesoInternoRepository,
  type SubirDocumentoPayload,
} from '../../infrastructure/persistence/axios-documento-proceso-interno-repository';

export const docsProcesoInternoQueryKey = (postulacionId: number | string) =>
  ['documentos-proceso-interno', String(postulacionId)] as const;

export function useDocumentosProcesoInterno(postulacionId: number | string | undefined) {
  const queryClient = useQueryClient();

  // ── Listar ──────────────────────────────────────────────────────────── //

  const { data: documentos = [], isLoading, refetch } = useQuery({
    queryKey: docsProcesoInternoQueryKey(postulacionId ?? ''),
    queryFn: () => documentoProcesoInternoRepository.listarPorPostulacion(postulacionId!),
    enabled: !!postulacionId,
  });

  // ── Subir ───────────────────────────────────────────────────────────── //

  const subirMutation = useMutation({
    mutationFn: (payload: SubirDocumentoPayload) =>
      documentoProcesoInternoRepository.subir(payload),
    onSuccess: () => {
      if (postulacionId) void queryClient.invalidateQueries({ queryKey: docsProcesoInternoQueryKey(postulacionId) });
    },
  });

  // ── Eliminar ────────────────────────────────────────────────────────── //

  const eliminarMutation = useMutation({
    mutationFn: (docId: number) =>
      documentoProcesoInternoRepository.eliminar(docId),
    onSuccess: () => {
      if (postulacionId) void queryClient.invalidateQueries({ queryKey: docsProcesoInternoQueryKey(postulacionId) });
    },
  });

  return {
    documentos,
    isLoading,
    refetch,
    subir: subirMutation.mutate,
    isSubiendo: subirMutation.isPending,
    subirError: subirMutation.error?.message ?? null,
    eliminar: eliminarMutation.mutate,
    isEliminando: eliminarMutation.isPending,
  };
}
