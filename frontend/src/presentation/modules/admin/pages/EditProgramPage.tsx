import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../shared/components/layout/MainLayout";
import BackButton from "../../shared/components/navigation/BackButton";
import ConfirmationModal from "../../shared/components/modals/ConfirmationModal";
import { ProgramEditForm } from "../components";
import { usePrograma } from "../../../../infraestructure/hooks";

function EditProgramPage() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleProgramUpdated = () => {
    setShowConfirmation(true);
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    navigate("/programas");
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

        {/* Program Edit Form */}
        {program && (
          <div className="flex justify-center mt-8">
            <ProgramEditForm 
              program={program} 
              onSuccess={handleProgramUpdated}
            />
          </div>
        )}

        {/* Success Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          title="Programa Actualizado"
          message="El programa se ha actualizado correctamente. Los cambios se aplicarán inmediatamente."
          icon={
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
              ✓
            </div>
          }
          buttonText="Volver a Programas"
          onClose={handleCloseModal}
          bgColor="bg-green-600"
        />
      </div>
    </MainLayout>
  );
}

export default EditProgramPage;
