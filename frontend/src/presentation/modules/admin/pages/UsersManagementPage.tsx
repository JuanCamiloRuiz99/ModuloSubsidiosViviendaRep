/**
 * Página de Gestión de Usuarios
 * Interfaz principal para crear, editar y gestionar usuarios del sistema
 * 
 * Arquitectura Hexagonal:
 * - Domain: Usuario (importado desde domain/usuarios)
 * - Infrastructure: hooks (useUsuarios, useUpdateUsuario, etc)
 * - Application: lógica de negocio (handlers)
 * - Presentation: componentes UI y renderizado
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import MainLayout from "../../shared/components/layout/MainLayout";
import PageHeader from "../../shared/components/layout/PageHeader";
import { StatCard } from "../../shared/components/cards";
import { SearchFilter } from "../../shared/components/filters";
import { ConfirmationDialog } from "../../shared/components/dialogs";
import {
  useUsuarios,
  useUsuariosStats,
  useUpdateUsuario,
  useCambiarEstadoUsuario,
  useDeleteUsuario,
} from "../../../../infraestructure/hooks";
import UsersTable from "../components/UsersTable";
import UserForm from "../components/UserForm";
import type { UsuarioFormData } from "../schemas/usuarioSchema";
import type { Usuario } from "../../../../domain/usuarios";

export default function UsersManagementPage() {
  const navigate = useNavigate();
  const [searchCedula, setSearchCedula] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "delete" | "status";
    usuario: Usuario | null;
    nuevoEstado?: "ACTIVO" | "INACTIVO";
  }>({
    type: "delete",
    usuario: null,
  });

  // Queries
  const { data: usuarios = [], isLoading: usuariosLoading, error: usuariosError } = useUsuarios();
  const { data: stats, isLoading: statsLoading, error: statsError } = useUsuariosStats();

  // Log para debugging
  useEffect(() => {
    console.log("[UsersManagementPage] Usuarios loaded:", {
      count: usuarios.length,
      data: usuarios,
      error: usuariosError,
      loading: usuariosLoading,
    });
  }, [usuarios, usuariosError, usuariosLoading]);

  // Log para estadísticas
  useEffect(() => {
    console.log("[UsersManagementPage] Stats loaded:", {
      stats: stats,
      loading: statsLoading,
      error: statsError,
    });
  }, [stats, statsLoading, statsError]);

  // Mutations
  const updateMutation = useUpdateUsuario(selectedUsuario?.id || 0);
  const cambiarEstadoMutation = useCambiarEstadoUsuario(
    selectedUsuario?.id || 0
  );
  const deleteMutation = useDeleteUsuario(selectedUsuario?.id || 0);

  // Handlers

  const handleEditUsuario = async (data: UsuarioFormData) => {
    if (!selectedUsuario) return;
    try {
      await updateMutation.mutateAsync(data);
      setIsEditModalOpen(false);
      setSelectedUsuario(null);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handleOpenEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsEditModalOpen(true);
  };

  const handleChangeStatus = (
    usuario: Usuario,
    nuevoEstado: "ACTIVO" | "INACTIVO"
  ) => {
    setSelectedUsuario(usuario);
    setConfirmDialog({
      type: "status",
      usuario,
      nuevoEstado,
    });
  };

  const handleConfirmChangeStatus = async () => {
    if (confirmDialog.nuevoEstado && selectedUsuario) {
      try {
        await cambiarEstadoMutation.mutateAsync(confirmDialog.nuevoEstado);
        setConfirmDialog({ type: "delete", usuario: null });
        setSelectedUsuario(null);
      } catch (error) {
        console.error("Error al cambiar estado:", error);
      }
    }
  };

  const handleDeleteUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setConfirmDialog({
      type: "delete",
      usuario,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setConfirmDialog({ type: "delete", usuario: null });
      setSelectedUsuario(null);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Estadísticas derivadas - Mapeadas a formato StatCard
  const statsCards = [
    {
      title: "Total Empleados",
      value: stats?.total || 0,
      description: "Total de usuarios en el sistema",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Usuarios Activos",
      value: stats?.activos || 0,
      description: "Empleados con acceso activo",
      borderColor: "border-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Usuarios Inactivos",
      value: (stats?.total || 0) - (stats?.activos || 0),
      description: "Empleados sin acceso activo",
      borderColor: "border-red-500",
      textColor: "text-red-600",
    },
    {
      title: "Administradores",
      value: stats?.por_rol?.ADMINISTRADOR || 0,
      description: "Usuarios con rol admin",
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Funcionarios",
      value: stats?.por_rol?.FUNCIONARIO || 0,
      description: "Usuarios con rol funcionario",
      borderColor: "border-orange-500",
      textColor: "text-orange-600",
    },
    {
      title: "Técnicos",
      value: stats?.por_rol?.TECNICO || 0,
      description: "Usuarios con rol técnico",
      borderColor: "border-indigo-500",
      textColor: "text-indigo-600",
    },
  ];

  // Filtrar usuarios por cédula
  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!searchCedula.trim()) return true;
    return usuario.numero_documento
      .toLowerCase()
      .includes(searchCedula.toLowerCase());
  });

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-7xl">
        {/* Encabezado con PageHeader */}
        <PageHeader
          title="Gestión de Empleados"
          description="Administra los empleados y sus roles en el sistema"
        >
          <button
            onClick={() => navigate("/usuarios/crear")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            ➕ Nuevo Empleado
          </button>
        </PageHeader>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Filtrador por Cédula */}
        <SearchFilter
          value={searchCedula}
          onChange={setSearchCedula}
          placeholder="Buscar por número de cédula..."
          label="Filtrar Empleados:"
        />

        {/* Mensaje de Error */}
        {usuariosError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error al cargar empleados</p>
              <p className="text-sm text-red-700 mt-1">{(usuariosError as Error).message}</p>
            </div>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <UsersTable
          usuarios={usuariosFiltrados}
          loading={usuariosLoading}
          onEdit={handleOpenEdit}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDeleteUsuario}
        />

      {/* Modal de Edición */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-lg z-50 shadow-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Editar Empleado
            </h2>
            {selectedUsuario && (
              <UserForm
                mode="edit"
                initialData={selectedUsuario}
                onSubmit={handleEditUsuario}
                isLoading={updateMutation.isPending}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Diálogos de Confirmación - Cambiar Estado */}
      <ConfirmationDialog
        isOpen={confirmDialog.type === "status" && confirmDialog.usuario !== null}
        title="¿Cambiar estado del empleado?"
        description={
          confirmDialog.usuario && (
            <>
              Vas a cambiar el estado de{" "}
              <strong>{confirmDialog.usuario.nombre_completo}</strong> a{" "}
              <strong>
                {confirmDialog.nuevoEstado === "ACTIVO"
                  ? "Activo"
                  : "Inactivo"}
              </strong>
              . Esta acción es reversible.
            </>
          )
        }
        onConfirm={handleConfirmChangeStatus}
        onCancel={() => setConfirmDialog({ type: "delete", usuario: null })}
        confirmLabel="Cambiar Estado"
        isDangerous={false}
        isLoading={cambiarEstadoMutation.isPending}
      />

      {/* Diálogos de Confirmación - Eliminar */}
      <ConfirmationDialog
        isOpen={confirmDialog.type === "delete" && confirmDialog.usuario !== null}
        title="Eliminar Empleado"
        description={
          confirmDialog.usuario && (
            <>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{confirmDialog.usuario.nombre_completo}</strong>? Esta
              acción no se puede deshacer.
            </>
          )
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ type: "delete", usuario: null })}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
      </div>
    </MainLayout>
  );
}
