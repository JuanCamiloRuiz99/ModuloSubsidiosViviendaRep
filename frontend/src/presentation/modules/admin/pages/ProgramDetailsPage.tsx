import { useParams } from "react-router-dom";
import MainLayout from "../../shared/components/layout/MainLayout";
import BackButton from "../../shared/components/navigation/BackButton";
import { StagesManagement } from "../components";
import { usePrograma } from "../../../../infraestructure/hooks";

function ProgramDetailsPage() {
  const { programId } = useParams<{ programId: string }>();

  // Validar que exista programId
  if (!programId) {
    return (
      <MainLayout centerContent={false}>
        <div className="w-full max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error: ID de programa no válido</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const {
    data: program,
    isLoading,
    isError,
    error,
  } = usePrograma(parseInt(programId));

  const handleEditForm = (stageId: string) => {
    console.log(`Editando formulario de etapa ${stageId}`);
    // TODO: Navegar a página de edición de formulario
  };

  const handlePublishStage = (stageId: string) => {
    console.log(`Publicando etapa ${stageId}`);
    // TODO: Llamar API para publicar etapa
  };

  const handleViewPostulaciones = (stageId: string) => {
    console.log(`Ver postulaciones de etapa ${stageId}`);
    // TODO: Navegar a página de postulaciones
  };

  const handleCloseStage = (stageId: string) => {
    console.log(`Cerrando etapa ${stageId}`);
    // TODO: Implementar confirmación y cerrar etapa
  };

  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        {/* Back Button */}
        <BackButton label="Volver a Programas" to="/programas" />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg text-gray-600">Cargando programa...</div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold">Error al cargar el programa</p>
            <p className="text-red-600 text-sm">{error instanceof Error ? error.message : "Error desconocido"}</p>
          </div>
        )}

        {/* Program Data */}
        {program && (
          <StagesManagement
            programName={program.nombre}
            programDescription={program.descripcion}
            onEditForm={handleEditForm}
            onPublishStage={handlePublishStage}
            onViewPostulaciones={handleViewPostulaciones}
            onCloseStage={handleCloseStage}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default ProgramDetailsPage;
