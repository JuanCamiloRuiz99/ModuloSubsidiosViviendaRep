/**
 * Hooks para Visitas Etapa 2.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  visitaEtapa2Repository,
  type CrearVisitaEtapa2Payload,
  type DatosHogarEtapa2,
} from '../../infrastructure/persistence/axios-visita-etapa2-repository';

const KEYS = {
  list: (params?: Record<string, string | number>) => ['visitas-etapa2', params] as const,
  detail: (id: number) => ['visita-etapa2', id] as const,
  datosHogar: (id: number) => ['visita-etapa2-datos-hogar', id] as const,
  documentos: (id: number) => ['visita-etapa2-documentos', id] as const,
};

export function useVisitasEtapa2(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => visitaEtapa2Repository.listar(params),
  });
}

export function useVisitaEtapa2Detail(id: number | null) {
  return useQuery({
    queryKey: KEYS.detail(id!),
    queryFn: () => visitaEtapa2Repository.obtener(id!),
    enabled: id !== null,
  });
}

export function useCrearVisitaEtapa2() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearVisitaEtapa2Payload) =>
      visitaEtapa2Repository.crear(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitas-etapa2'] }),
  });
}

export function useGuardarDatosHogarE2(visitaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DatosHogarEtapa2>) =>
      visitaEtapa2Repository.guardarDatosHogar(visitaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.datosHogar(visitaId) });
      qc.invalidateQueries({ queryKey: KEYS.detail(visitaId) });
    },
  });
}

export function useDocumentosVisitaE2(visitaId: number | null) {
  return useQuery({
    queryKey: KEYS.documentos(visitaId!),
    queryFn: () => visitaEtapa2Repository.listarDocumentos(visitaId!),
    enabled: visitaId !== null,
  });
}

export function useSubirDocumentoE2(visitaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      tipoDocumento,
      archivo,
      observaciones,
    }: {
      tipoDocumento: string;
      archivo: File;
      observaciones?: string;
    }) => visitaEtapa2Repository.subirDocumento(visitaId, tipoDocumento, archivo, observaciones),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.documentos(visitaId) }),
  });
}

export function useEliminarDocumentoE2(visitaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: number) =>
      visitaEtapa2Repository.eliminarDocumento(visitaId, docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.documentos(visitaId) }),
  });
}
