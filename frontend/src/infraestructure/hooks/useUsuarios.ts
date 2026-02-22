/**
 * Hooks personalizados para gestión de usuarios
 * Usando TanStack Query para caché y manejo de estado del servidor
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  usuarioAPI,
  type CreateUsuarioDTO,
  type UpdateUsuarioDTO,
} from "../api/usuarios.api";
import type { Usuario, UsuarioStats } from "../../domain/usuarios/usuario.model";

const USUARIOS_QUERY_KEY = ["usuarios"];
const USUARIOS_STATS_QUERY_KEY = ["usuarios", "estadisticas"];

/**
 * Hook para obtener la lista de usuarios
 */
export function useUsuarios(params?: {
  rol?: string;
  estado?: string;
  buscar?: string;
}): UseQueryResult<Usuario[], Error> {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, params],
    queryFn: async () => {
      console.log("[useUsuarios] Fetching usuarios con params:", params);
      try {
        const data = await usuarioAPI.listar(params);
        console.log("[useUsuarios] ✓ Usuarios obtenidos:", data);
        return data;
      } catch (error) {
        console.error("[useUsuarios] ❌ Error fetching:", error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook para obtener un usuario específico
 */
export function useUsuario(id: number): UseQueryResult<Usuario, Error> {
  return useQuery({
    queryKey: [...USUARIOS_QUERY_KEY, id],
    queryFn: () => usuarioAPI.obtenerPorId(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de usuarios
 */
export function useUsuariosStats(): UseQueryResult<UsuarioStats, Error> {
  return useQuery({
    queryKey: USUARIOS_STATS_QUERY_KEY,
    queryFn: async () => {
      console.log("[useUsuariosStats] Fetching estadísticas");
      try {
        const data = await usuarioAPI.obtenerEstadisticas();
        console.log("[useUsuariosStats] ✓ Estadísticas obtenidas:", data);
        return data;
      } catch (error) {
        console.error("[useUsuariosStats] ❌ Error fetching:", error);
        throw error;
      }
    },
    staleTime: 0, // Siempre refetch
    gcTime: 0, // No cachear
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUsuario(): UseMutationResult<
  Usuario,
  Error,
  CreateUsuarioDTO
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUsuarioDTO) => {
      console.log("[useCreateUsuario] Creating usuario:", data);
      console.log("[useCreateUsuario] Data keys:", Object.keys(data));
      console.log("[useCreateUsuario] Data types:", {
        nombre: typeof data.nombre,
        apellidos: typeof data.apellidos,
        numero_documento: typeof data.numero_documento,
        correo: typeof data.correo,
        rol: typeof data.rol,
        estado: typeof data.estado,
      });
      try {
        const result = await usuarioAPI.crear(data);
        console.log("[useCreateUsuario] ✓ Usuario creado:", result);
        return result;
      } catch (error) {
        console.error("[useCreateUsuario] ❌ Error creating:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log("[useCreateUsuario] onSuccess - Invalidating queries");
      // Invalida la lista de usuarios para refrescarla
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_QUERY_KEY,
        exact: false,
      });
      // Invalida estadísticas
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_STATS_QUERY_KEY,
        exact: false,
      });
      console.log("[useCreateUsuario] ✓ Queries invalidated");
    },
    onError: (error) => {
      console.error("[useCreateUsuario] onError:", error);
    },
  });
}

/**
 * Hook para actualizar un usuario
 */
export function useUpdateUsuario(
  id: number
): UseMutationResult<Usuario, Error, UpdateUsuarioDTO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsuarioDTO) => usuarioAPI.actualizar(id, data),
    onSuccess: async (data) => {
      // Actualiza el usuario en caché
      queryClient.setQueryData([...USUARIOS_QUERY_KEY, id], data);
      // Invalida la lista
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_QUERY_KEY,
        exact: false,
      });
    },
  });
}

/**
 * Hook para cambiar el estado de un usuario
 */
export function useCambiarEstadoUsuario(
  id: number
): UseMutationResult<Usuario, Error, "ACTIVO" | "INACTIVO"> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estado: "ACTIVO" | "INACTIVO") =>
      usuarioAPI.cambiarEstado(id, estado),
    onSuccess: async (data) => {
      // Actualiza el usuario en caché
      queryClient.setQueryData([...USUARIOS_QUERY_KEY, id], data);
      // Invalida la lista
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_QUERY_KEY,
        exact: false,
      });
      // Invalida estadísticas
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_STATS_QUERY_KEY,
        exact: false,
      });
    },
  });
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUsuario(
  id: number
): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usuarioAPI.eliminar(id),
    onSuccess: async () => {
      // Invalida la lista
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_QUERY_KEY,
        exact: false,
      });
      // Invalida estadísticas
      await queryClient.invalidateQueries({
        queryKey: USUARIOS_STATS_QUERY_KEY,
        exact: false,
      });
    },
  });
}


