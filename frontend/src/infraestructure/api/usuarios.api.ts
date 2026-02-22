/**
 * API Client para Usuarios
 * Define todas las llamadas HTTP al backend para usuarios
 */
import { apiClient } from "./client";
import type { Usuario, UsuarioStats } from "../../domain/usuarios/usuario.model";

export interface CreateUsuarioDTO {
  nombre: string;
  apellidos: string;
  numero_documento: string;
  correo: string;
  rol: "ADMINISTRADOR" | "FUNCIONARIO" | "TECNICO";
  estado?: "ACTIVO" | "INACTIVO";
}

export type UpdateUsuarioDTO = Partial<CreateUsuarioDTO>;

/**
 * Obtiene lista de usuarios con filtros opcionales
 */
export const listarUsuarios = async (params?: {
  rol?: string;
  estado?: string;
  buscar?: string;
}): Promise<Usuario[]> => {
  let endpoint = '/usuarios/';
  const queryParams = new URLSearchParams();
  
  if (params?.rol) queryParams.append('rol', params.rol);
  if (params?.estado) queryParams.append('estado', params.estado);
  if (params?.buscar) queryParams.append('buscar', params.buscar);
  
  if (queryParams.toString()) {
    endpoint += '?' + queryParams.toString();
  }

  console.log("[listarUsuarios] Requesting endpoint:", endpoint);
  const response = await apiClient(endpoint);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  console.log("[listarUsuarios] Response data:", data);
  return data;
};

/**
 * Obtiene un usuario específico
 */
export const obtenerUsuario = async (id: number): Promise<Usuario> => {
  const response = await apiClient(`/usuarios/${id}/`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Crea un nuevo usuario
 */
export const crearUsuario = async (data: CreateUsuarioDTO): Promise<Usuario> => {
  console.log("[crearUsuario] Payload to send:", data);
  console.log("[crearUsuario] JSON stringified:", JSON.stringify(data));
  
  const response = await apiClient('/usuarios/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  console.log("[crearUsuario] Usuario creado:", result);
  return result;
};

/**
 * Actualiza un usuario completo
 */
export const actualizarUsuario = async (
  id: number,
  data: UpdateUsuarioDTO
): Promise<Usuario> => {
  const response = await apiClient(`/usuarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Actualiza parcialmente un usuario
 */
export const actualizarUsuarioParcial = async (
  id: number,
  data: UpdateUsuarioDTO
): Promise<Usuario> => {
  const response = await apiClient(`/usuarios/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Elimina un usuario
 */
export const eliminarUsuario = async (id: number): Promise<void> => {
  const response = await apiClient(`/usuarios/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
};

/**
 * Cambia el estado de un usuario
 */
export const cambiarEstadoUsuario = async (
  id: number,
  estado: "ACTIVO" | "INACTIVO"
): Promise<Usuario> => {
  const response = await apiClient(`/usuarios/${id}/cambiar_estado/`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Obtiene estadísticas de usuarios
 */
export const obtenerEstadisticasUsuarios = async (): Promise<UsuarioStats> => {
  const response = await apiClient('/usuarios/estadisticas/');
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// Objeto con métodos para mantener compatibilidad
export const usuarioAPI = {
  listar: listarUsuarios,
  obtenerPorId: obtenerUsuario,
  crear: crearUsuario,
  actualizar: actualizarUsuario,
  actualizarParcial: actualizarUsuarioParcial,
  eliminar: eliminarUsuario,
  cambiarEstado: cambiarEstadoUsuario,
  obtenerEstadisticas: obtenerEstadisticasUsuarios,
};
