/**
 * UsuariosPage - Página principal de gestión de usuarios
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  useUsuarios,
  useCrearUsuario,
  useActualizarUsuario,
  useEliminarUsuario,
  useCambiarEstadoUsuario,
} from '../hooks';
import { UsuariosList, CreateUsuarioModal, EditarUsuarioModal } from '../components';
import type { CrearUsuarioFormData } from '../components/CreateUsuarioModal';
import type { EditarUsuarioFormData } from '../components/EditarUsuarioModal';
import { UsuarioListItemDTO, CrearUsuarioDTO, ActualizarUsuarioDTO } from '../../application/dtos';
import { StatCard, HeaderPanel } from '../../../../shared/presentation/components';
import { usuarioService } from '../di';

export const UsuariosPage: React.FC = () => {
  const [filter, setFilter] = useState({ page: 1, pageSize: 10, search: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UsuarioListItemDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { usuarios, total, page, pageSize, totalPages, isLoading, isFetching, error, stats, refetch } =
    useUsuarios(filter);

  const crearMutation = useCrearUsuario();
  const actualizarMutation = useActualizarUsuario();
  const eliminarMutation = useEliminarUsuario();
  const cambiarEstadoMutation = useCambiarEstadoUsuario();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter((prev) => ({ ...prev, page: 1, search: e.target.value }));
  };

  const handleSubmitCreateUser = async (formData: CrearUsuarioFormData): Promise<void> => {
    try {
      const dto = new CrearUsuarioDTO(
        formData.nombre,
        formData.apellido,
        formData.email,
        formData.numeroDocumento,
        Number(formData.idRol),
        formData.password
      );
      await crearMutation.mutateAsync(dto);
      setIsCreateModalOpen(false);
      showToast(`✅ Usuario ${formData.nombre} ${formData.apellido} creado exitosamente`);
      void refetch(); // recarga en segundo plano
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al crear usuario'}`, 'error');
      throw err; // re-lanzar para que el modal mantenga el formulario abierto
    }
  };

  const handleEdit = async (usuario: UsuarioListItemDTO) => {
    try {
      const completo = await usuarioService.obtenerUsuario(usuario.id.toString());
      setSelectedUserToEdit({
        id: completo.id,
        nombre: completo.nombre,
        apellido: completo.apellido,
        email: completo.email,
        numeroDocumento: completo.numeroDocumento,
        idRol: completo.idRol,
        rolNombre: usuario.rolNombre,
        estado: completo.estado,
        ultimoAcceso: completo.ultimoAcceso,
        createdAt: completo.createdAt,
        updatedAt: completo.updatedAt,
        centroAtencion: completo.centroAtencion,
        telefono: completo.telefono,
      });
      setIsEditModalOpen(true);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'No se pudieron cargar los datos del usuario'}`, 'error');
    }
  };

  const handleSubmitEditUser = async (formData: EditarUsuarioFormData): Promise<void> => {
    try {
      const dto = new ActualizarUsuarioDTO(
        formData.id.toString(),
        formData.nombre,
        formData.apellido,
        formData.email,
        formData.numeroDocumento,
        Number(formData.idRol)
      );
      await actualizarMutation.mutateAsync(dto);
      setIsEditModalOpen(false);
      setSelectedUserToEdit(null);
      showToast(`✅ Usuario ${formData.nombre} ${formData.apellido} actualizado exitosamente`);
      void refetch();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al actualizar usuario'}`, 'error');
      throw err;
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;
    try {
      await eliminarMutation.mutateAsync(id.toString());
      showToast('✅ Usuario eliminado exitosamente');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al eliminar usuario'}`, 'error');
    }
  };

  const handleChangeStatus = async (id: string | number, estado: string) => {
    const nuevoEstado = estado as 'activo' | 'inactivo';
    const mensaje = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    const confirmed = window.confirm(`¿Deseas ${mensaje} este usuario?`);
    if (!confirmed) return;
    try {
      await cambiarEstadoMutation.mutateAsync({ id: id.toString(), nuevoEstado });
      showToast(`✅ Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : `Error al ${mensaje} usuario`}`, 'error');
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) setFilter((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (page < totalPages) setFilter((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Toast de confirmación — inline fixed, z-index > Radix z-50 */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span className="text-xl font-bold">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(null); }}
            className="ml-3 text-white/80 hover:text-white text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Panel */}
        <HeaderPanel
          title="Gestión de Usuarios"
          subtitle="Administra usuarios del sistema, roles y permisos"
          actionLabel="Crear Usuario"
          onAction={() => setIsCreateModalOpen(true)}
        />

        {/* Estadísticas - Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            color="blue"
          />
          <StatCard
            title="Activos"
            value={stats.activos}
            color="green"
          />
          <StatCard
            title="Admins"
            value={stats.admins}
            color="purple"
          />
          <StatCard
            title="Funcionarios"
            value={stats.funcionarios}
            color="orange"
          />
          <StatCard
            title="Técnicos"
            value={stats.tecnicos}
            color="blue"
          />
          <StatCard
            title="Inactivos"
            value={stats.inactivos}
            color="red"
          />
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por cédula..."
                value={filter.search}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {(error as Error).message}
            </div>
          )}
        </div>

        {/* Tabla de Usuarios */}
        <UsuariosList
          usuarios={usuarios}
          isLoading={isLoading || isFetching || eliminarMutation.isPending || cambiarEstadoMutation.isPending}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onChangeStatus={handleChangeStatus}
        />

        {/* Paginación */}
        <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            Mostrando {usuarios.length} de {total} usuarios (Página {page} de {totalPages})
          </p>

          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400"
            >
              Anterior
            </button>

            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal para crear usuario */}
      <CreateUsuarioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSubmitCreateUser}
        isLoading={crearMutation.isPending}
      />

      {/* Modal para editar usuario */}
      <EditarUsuarioModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedUserToEdit(null); }}
        onSubmit={handleSubmitEditUser}
        usuario={selectedUserToEdit}
        isLoading={actualizarMutation.isPending}
      />
    </div>
  );
};
