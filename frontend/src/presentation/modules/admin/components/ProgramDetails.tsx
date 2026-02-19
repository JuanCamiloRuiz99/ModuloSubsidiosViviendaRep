import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusFilter from "../../shared/components/filters/StatusFilter";
import ConfirmDialog from "../../shared/components/modals/ConfirmDialog";
import ProgramCard from "./ProgramCard";
import ProgramActionButtons from "./ProgramActionButtons";
import ProgramActionModal from "./ProgramActionModal";
import { useProgramas, useChangeProgramState } from "../../../../infraestructure/hooks";
import type { ProgramaResponse } from "../../../../infraestructure/api";
import { PROGRAMA_ESTADO_LABELS, PROGRAMA_ESTADO_COLORS } from "../constants/programConstants";

/**
 * Componente para mostrar y gestionar la lista de programas
 * Incluye filtrado por estado y acciones para cada programa
 */
function ProgramDetails() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<string>("todos");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "disable" | "enable" | null;
    program: ProgramaResponse | null;
  }>({
    isOpen: false,
    type: null,
    program: null,
  });
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    program: ProgramaResponse | null;
  }>({
    isOpen: false,
    program: null,
  });

  const { data, isLoading, isError } = useProgramas(
    getEstadoBackend(activeStatus)
  );

  const changeStateMutation = useChangeProgramState();

  const programs = data?.results || [];

  /**
   * Mapea el estado del filtro UI al estado del backend
   */
  function getEstadoBackend(statusId: string): string | undefined {
    if (!statusId || statusId === "todos" || statusId === "all") return undefined;
    
    const estadoMap: Record<string, string> = {
      activos: "ACTIVO",
      borradores: "BORRADOR",
      inhabilitados: "INHABILITADO",
    };
    
    return estadoMap[statusId] || undefined;
  }

  const statusOptions = [
    { label: "Todos", count: data?.count || 0, id: "todos" },
    {
      label: "Activos",
      count: programs.filter((p: ProgramaResponse) => p.estado === "ACTIVO").length,
      id: "activos",
    },
    {
      label: "Borradores",
      count: programs.filter((p: ProgramaResponse) => p.estado === "BORRADOR").length,
      id: "borradores",
    },
    {
      label: "Inhabilitados",
      count: programs.filter((p: ProgramaResponse) => p.estado === "INHABILITADO").length,
      id: "inhabilitados",
    },
  ];

  const filteredPrograms = programs.filter((program: ProgramaResponse) => {
    if (!activeStatus || activeStatus === "todos" || activeStatus === "all") return true;
    if (activeStatus === "activos") return program.estado === "ACTIVO";
    if (activeStatus === "borradores") return program.estado === "BORRADOR";
    if (activeStatus === "inhabilitados") return program.estado === "INHABILITADO";
    return true;
  });

  const getStatusStyles = (status: string) => {
    return (
      PROGRAMA_ESTADO_COLORS[status as keyof typeof PROGRAMA_ESTADO_COLORS] ||
      PROGRAMA_ESTADO_COLORS.BORRADOR
    );
  };

  const getStatusLabel = (status: string) => {
    return (
      PROGRAMA_ESTADO_LABELS[status as keyof typeof PROGRAMA_ESTADO_LABELS] || status
    );
  };

  const openDisableDialog = (program: ProgramaResponse) => {
    setConfirmDialog({
      isOpen: true,
      type: "disable",
      program,
    });
  };

  const openEnableDialog = (program: ProgramaResponse) => {
    setConfirmDialog({
      isOpen: true,
      type: "enable",
      program,
    });
  };

  const handleConfirmDisable = () => {
    if (confirmDialog.program) {
      changeStateMutation.mutate(
        {
          programId: confirmDialog.program.id,
          nuevoEstado: "INHABILITADO",
        },
        {
          onSuccess: () => {
            setConfirmDialog({ isOpen: false, type: null, program: null });
          },
        }
      );
    }
  };

  const handleConfirmEnable = () => {
    if (confirmDialog.program) {
      changeStateMutation.mutate(
        {
          programId: confirmDialog.program.id,
          nuevoEstado: "ACTIVO",
        },
        {
          onSuccess: () => {
            setConfirmDialog({ isOpen: false, type: null, program: null });
          },
        }
      );
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ isOpen: false, type: null, program: null });
  };

  const handleOpenActionModal = (program: ProgramaResponse) => {
    setActionModal({ isOpen: true, program });
  };

  const handleCloseActionModal = () => {
    setActionModal({ isOpen: false, program: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Cargando programas...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Error al cargar los programas</p>
        <p className="text-red-600 text-sm">Por favor intenta de nuevo más tarde</p>
      </div>
    );
  }

  return (
    <div>
      <StatusFilter
        statuses={statusOptions}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      {/* Contenido de programas */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-semibold">
            No hay programas {activeStatus !== "todos" ? `en estado ${activeStatus}` : "disponibles"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map((program: ProgramaResponse) => {
            const styles = getStatusStyles(program.estado);
            return (
              <ProgramCard
                key={program.id}
                id={String(program.id)}
                title={program.nombre}
                description={program.descripcion}
                status={getStatusLabel(program.estado) as any}
                entity={program.entidad_responsable}
                programCode={program.codigo_programa}
                borderColor={styles.borderColor}
                statusBgColor={styles.statusBgColor}
                statusColor={styles.statusColor}
                statusDot={styles.statusDot}
                onActionClick={() => handleOpenActionModal(program)}
              >
                <ProgramActionButtons
                  program={program}
                  isPending={changeStateMutation.isPending}
                  onNavigateToStages={(id) => navigate(`/programas/${id}`)}
                  onDisable={openDisableDialog}
                  onEnable={openEnableDialog}
                />
              </ProgramCard>
            );
          })}
        </div>
      )}

      {/* Diálogo de confirmación para inhabilitar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === "disable"}
        title="Inhabilitar Programa"
        message={`¿Estás seguro de que deseas inhabilitar el programa "${confirmDialog.program?.nombre}"? Los usuarios ya no podrán postularse a este programa.`}
        confirmText="Inhabilitar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={changeStateMutation.isPending}
        onConfirm={handleConfirmDisable}
        onCancel={handleCancelDialog}
      />

      {/* Diálogo de confirmación para rehabilitar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === "enable"}
        title="Rehabilitar Programa"
        message={`¿Deseas rehabilitar el programa "${confirmDialog.program?.nombre}"? Los usuarios podrán postularse nuevamente a este programa.`}
        confirmText="Rehabilitar"
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={changeStateMutation.isPending}
        onConfirm={handleConfirmEnable}
        onCancel={handleCancelDialog}
      />

      {/* Modal de acciones para editar/eliminar */}
      <ProgramActionModal
        isOpen={actionModal.isOpen}
        program={actionModal.program}
        onClose={handleCloseActionModal}
      />
    </div>
  );
}

export default ProgramDetails;
