/**
 * ProgramasPage - Página principal de gestión de programas de vivienda
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useProgramas,
  useCrearPrograma,
  useActualizarPrograma,
  useCambiarEstadoPrograma,
  useEliminarPrograma,
} from '../hooks';
import { ProgramaCard, CreateProgramaModal, EditarProgramaModal } from '../components';
import type { ProgramaCardItem } from '../components';
import type { CrearProgramaFormData } from '../components/CreateProgramaModal';
import type { EditarProgramaFormData } from '../components/EditarProgramaModal';
import { CrearProgramaDTO, ActualizarProgramaDTO } from '../../application/dtos';
import { StatCard, HeaderPanel } from '../../../../shared/presentation/components';

const FILTROS = [
  { label: 'Todos', value: undefined },
  { label: 'Activos', value: 'ACTIVO' },
  { label: 'Borradores', value: 'BORRADOR' },
  { label: 'Inhabilitados', value: 'INHABILITADO' },
  { label: 'Culminados', value: 'CULMINADO' },
] as const;

export const ProgramasPage: React.FC = () => {
  const navigate = useNavigate();
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState<ProgramaCardItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { programas, isLoading, error, stats, refetch } = useProgramas({
    estado: estadoFiltro,
    pageSize: 50,
  });

  const crearMutation = useCrearPrograma();
  const actualizarMutation = useActualizarPrograma();
  const eliminarMutation = useEliminarPrograma();
  const cambiarEstadoMutation = useCambiarEstadoPrograma();

  const handleCreateSubmit = async (formData: CrearProgramaFormData): Promise<void> => {
    try {
      const dto = new CrearProgramaDTO(
        formData.nombre,
        formData.descripcion,
        formData.entidadResponsable
      );
      await crearMutation.mutateAsync(dto);
      setIsCreateModalOpen(false);
      showToast(`✅ Programa "${formData.nombre}" creado exitosamente`);
      void refetch();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al crear programa'}`, 'error');
      throw err;
    }
  };

  const handleEditClick = (programa: ProgramaCardItem) => {
    setSelectedPrograma(programa);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: EditarProgramaFormData): Promise<void> => {
    try {
      const dto = new ActualizarProgramaDTO(
        formData.id,
        formData.nombre,
        formData.descripcion,
        formData.entidadResponsable
      );
      await actualizarMutation.mutateAsync(dto);
      setIsEditModalOpen(false);
      setSelectedPrograma(null);
      showToast('✅ Programa actualizado exitosamente');
      void refetch();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al actualizar programa'}`, 'error');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      '¿Eliminar este programa? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;
    try {
      await eliminarMutation.mutateAsync(id);
      showToast('✅ Programa eliminado exitosamente');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Error al eliminar programa'}`, 'error');
    }
  };

  const handleGestionarEtapas = (programa: ProgramaCardItem) => {
    navigate(`/programas/${programa.id}/etapas`);
  };

  const [isEstadoPending, setIsEstadoPending] = useState<string | null>(null);

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    const strId = String(id);
    setIsEstadoPending(strId);
    try {
      await cambiarEstadoMutation.mutateAsync({ id: strId, nuevoEstado });
      const labels: Record<string, string> = { ACTIVO: 'publicado', INHABILITADO: 'inhabilitado', BORRADOR: 'pasado a borrador' };
      showToast(`✅ Programa ${labels[nuevoEstado] ?? nuevoEstado} exitosamente`);
      void refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.detail ??
        (err instanceof Error ? err.message : 'Error al cambiar estado');
      showToast(`❌ ${msg}`, 'error');
    } finally {
      setIsEstadoPending(null);
    }
  };

  const programasItems: ProgramaCardItem[] = programas.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    entidadResponsable: p.entidadResponsable,
    codigoPrograma: p.codigoPrograma,
    estado: p.estado,
    fechaCreacion: p.fechaCreacion,
  }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Toast */}
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
            onClick={() => {
              if (toastTimer.current) clearTimeout(toastTimer.current);
              setToast(null);
            }}
            className="ml-3 text-white/80 hover:text-white text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <HeaderPanel
          title="Programas de Vivienda"
          subtitle="Administra los programas de subsidios de vivienda"
          actionLabel="Crear Programa"
          onAction={() => setIsCreateModalOpen(true)}
        />

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Programas" value={stats.total} color="blue" />
          <StatCard title="Activos" value={stats.activos} color="green" />
          <StatCard title="Borradores" value={stats.borradores} color="orange" />
          <StatCard title="Inhabilitados" value={stats.inhabilitados} color="red" />
          <StatCard title="Culminados" value={stats.culminados} color="purple" />
        </div>

        {/* Filtros por estado */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.label}
              onClick={() => setEstadoFiltro(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                estadoFiltro === f.value
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error al cargar programas:{' '}
            {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        )}

        {/* Contenido */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Cargando programas...</div>
        ) : programasItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              {estadoFiltro
                ? `No hay programas con estado "${estadoFiltro}"`
                : 'No hay programas registrados'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Crear primer programa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programasItems.map((programa) => (
              <ProgramaCard
                key={programa.id}
                programa={programa}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onCambiarEstado={handleCambiarEstado}
                onGestionarEtapas={handleGestionarEtapas}
                isEstadoPending={isEstadoPending === programa.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateProgramaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={crearMutation.isPending}
      />
      <EditarProgramaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPrograma(null);
        }}
        onSubmit={handleEditSubmit}
        programa={selectedPrograma}
        isLoading={actualizarMutation.isPending}
      />
    </div>
  );
};
