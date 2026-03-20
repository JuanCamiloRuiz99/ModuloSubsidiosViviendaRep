/**
 * UsuariosList Component - Tabla de usuarios horizontal
 * Usa Radix DropdownMenu para acciones y Radix Dialog para ficha
 */

import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { UsuarioListItemDTO } from '../../application/dtos';

interface UsuariosListProps {
  usuarios: UsuarioListItemDTO[];
  isLoading?: boolean;
  onEdit?: (usuario: UsuarioListItemDTO) => void;
  onDelete?: (id: string | number) => void;
  onChangeRole?: (usuario: UsuarioListItemDTO) => void;
  onChangeStatus?: (id: string | number, estado: string) => void;
}

const roleConfig: Record<number, { name: string; bgColor: string; textColor: string }> = {
  1: { name: 'Administrador', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  2: { name: 'Funcionario', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  3: { name: 'Técnico de Visitas', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
};

const getRoleConfig = (idRol: number) =>
  roleConfig[idRol] ?? { name: `Rol ${idRol}`, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };

const getStateConfig = (estado: string) => {
  const isActive = estado === 'activo' || estado === 'ACTIVO';
  return isActive
    ? { name: 'Activo', bgColor: 'bg-green-100', textColor: 'text-green-700' }
    : { name: 'Inactivo', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
};

const getInitials = (nombre: string, apellido: string) =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

const formatDate = (date?: Date | string): string => {
  if (!date) return 'Sin registro';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Sin registro';
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota',
  });
};

const formatDateTime = (date?: Date | string): string => {
  if (!date) return 'Sin registro';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Sin registro';
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });
};

export const UsuariosList: React.FC<UsuariosListProps> = ({
  usuarios,
  isLoading = false,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioListItemDTO | null>(null);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>;
  }

  if (usuarios.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay usuarios para mostrar</div>;
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="min-w-full border-collapse">
          <tbody>
            {usuarios.map((usuario) => {
              const role = getRoleConfig(usuario.idRol);
              const state = getStateConfig(usuario.estado);
              const isActive = usuario.estado === 'activo' || usuario.estado === 'ACTIVO';
              const initials = getInitials(usuario.nombre, usuario.apellido);

              return (
                <tr
                  key={usuario.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors h-20"
                >
                  {/* Avatar y Nombre */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                        <p className="text-xs text-gray-500">
                          Creación: {formatDate(usuario.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Documento */}
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {usuario.numeroDocumento || '-'}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>

                  {/* Rol */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${role.bgColor} ${role.textColor}`}
                    >
                      {role.name}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${state.bgColor} ${state.textColor}`}
                    >
                      {state.name}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Radix DropdownMenu */}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            title="Más opciones"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                            sideOffset={4}
                            align="end"
                          >
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer outline-none"
                              onSelect={() => onEdit?.(usuario)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 cursor-pointer outline-none"
                              onSelect={() =>
                                onChangeStatus?.(usuario.id, isActive ? 'inactivo' : 'activo')
                              }
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              {isActive ? 'Desactivar' : 'Activar'}
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                              onSelect={() => onDelete?.(usuario.id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>

                      {/* Botón Ver Ficha */}
                      <button
                        onClick={() => setSelectedUsuario(usuario)}
                        title="Ver información del usuario"
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Radix Dialog para ficha del usuario */}
      <Dialog.Root
        open={!!selectedUsuario}
        onOpenChange={(open) => !open && setSelectedUsuario(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-50 p-8 focus:outline-none">
            {selectedUsuario && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl">
                      {getInitials(selectedUsuario.nombre, selectedUsuario.apellido)}
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-gray-900">
                        {selectedUsuario.nombre} {selectedUsuario.apellido}
                      </Dialog.Title>
                      <p className="text-gray-500">ID: {selectedUsuario.id}</p>
                    </div>
                  </div>
                  <Dialog.Close className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Dialog.Close>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Documento', value: selectedUsuario.numeroDocumento || '-' },
                    { label: 'Email', value: selectedUsuario.email },
                  ].map(({ label, value }) => (
                    <div key={label} className="border-b border-gray-200 pb-4">
                      <p className="text-sm text-gray-500 uppercase tracking-tight">{label}</p>
                      <p className="text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 uppercase tracking-tight">Rol</p>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleConfig(selectedUsuario.idRol).bgColor} ${getRoleConfig(selectedUsuario.idRol).textColor}`}
                      >
                        {getRoleConfig(selectedUsuario.idRol).name}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 uppercase tracking-tight">Estado</p>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStateConfig(selectedUsuario.estado).bgColor} ${getStateConfig(selectedUsuario.estado).textColor}`}
                      >
                        {getStateConfig(selectedUsuario.estado).name}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 uppercase tracking-tight">Fecha de Creación</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedUsuario.createdAt)}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 uppercase tracking-tight">Última actualización</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDateTime(selectedUsuario.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Dialog.Close asChild>
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Cerrar
                    </button>
                  </Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
