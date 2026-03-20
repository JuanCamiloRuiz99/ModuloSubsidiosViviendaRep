/**
 * usePostulacionActions - TanStack Query mutations para acciones sobre postulaciones.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostulacionApplicationService } from '../../application';
import { AxiosPostulacionRepository } from '../../infrastructure';
import {
  CrearPostulacionDTO,
  RevisarPostulacionDTO,
  AprobarPostulacionDTO,
  RechazarPostulacionDTO,
  AnularPostulacionDTO,
} from '../../application/dtos/postulacion-in';
import { POSTULACIONES_QUERY_KEY } from './use-postulaciones';

const service = new PostulacionApplicationService(new AxiosPostulacionRepository());

export function useCrearPostulacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearPostulacionDTO) => service.crear(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTULACIONES_QUERY_KEY() });
    },
  });
}

export function useRevisarPostulacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.revisar(new RevisarPostulacionDTO(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTULACIONES_QUERY_KEY() });
    },
  });
}

export function useAprobarPostulacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, puntaje }: { id: string; puntaje: number }) =>
      service.aprobar(new AprobarPostulacionDTO(id, puntaje)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTULACIONES_QUERY_KEY() });
    },
  });
}

export function useRechazarPostulacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      service.rechazar(new RechazarPostulacionDTO(id, motivo)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTULACIONES_QUERY_KEY() });
    },
  });
}

export function useAnularPostulacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      service.anular(new AnularPostulacionDTO(id, motivo)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTULACIONES_QUERY_KEY() });
    },
  });
}

import {
  CrearPostulacionDTO,
  RevisarPostulacionDTO,
  AprobarPostulacionDTO,
  RechazarPostulacionDTO,
  AnularPostulacionDTO,
} from '../application';

const service = new PostulacionApplicationService(new AxiosPostulacionRepository());

export function usePostulacionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (
    numeroDocumento: string,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    direccion: string,
    programaId: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const dto = new CrearPostulacionDTO(
        numeroDocumento,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        programaId
      );
      return await service.crear(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revisar = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const dto = new RevisarPostulacionDTO(id);
      return await service.revisar(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const aprobar = async (id: string, puntaje: number) => {
    try {
      setLoading(true);
      setError(null);
      const dto = new AprobarPostulacionDTO(id, puntaje);
      return await service.aprobar(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rechazar = async (id: string, motivo: string) => {
    try {
      setLoading(true);
      setError(null);
      const dto = new RechazarPostulacionDTO(id, motivo);
      return await service.rechazar(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const anular = async (id: string, motivo: string) => {
    try {
      setLoading(true);
      setError(null);
      const dto = new AnularPostulacionDTO(id, motivo);
      return await service.anular(dto);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { crear, revisar, aprobar, rechazar, anular, loading, error };
}
