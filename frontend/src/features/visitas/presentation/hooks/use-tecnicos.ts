/**
 * useTecnicos – Devuelve la lista de usuarios con rol TECNICO_VISITANTE (activos).
 */

import { useUsuarios } from '../../../usuarios/presentation/hooks/useUsuarios';
import { RolUsuario } from '../../../usuarios/domain/usuario';

export function useTecnicos() {
  const { usuarios, isLoading, error, refetch } = useUsuarios({
    pageSize: 200,
    idRol: RolUsuario.TECNICO_VISITANTE,
    estado: 'activo',
  });

  return {
    tecnicos: usuarios,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
