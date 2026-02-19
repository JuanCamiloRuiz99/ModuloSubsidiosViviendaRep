import { useState } from "react";
import MainLayout from "../../shared/components/layout/MainLayout";
import { ProgramCreationForm } from "../components";
import ConfirmationModal from "../../shared/components/modals/ConfirmationModal";

function CreateProgramPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleProgramCreated = (_code: string) => {
    setShowConfirmation(true);
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    // Opcionalmente: redirigir a programas o al dashboard
  };

  return (
    <MainLayout centerContent={true}>
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Crear Nuevo Programa
          </h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para crear un nuevo programa de subsidios
          </p>
        </div>

        <div className="flex justify-center">
          <ProgramCreationForm onSuccess={handleProgramCreated} />
        </div>

        <ConfirmationModal
          isOpen={showConfirmation}
          title="Mensaje de Confirmación"
          message={`El programa se ha creado correctamente, el estado inicial del programa es "borrador", diríjate a la sección de configuración para completar los requisitos y publicar el programa`}
          icon={
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
              ℹ
            </div>
          }
          buttonText="Ir a configuración"
          onClose={handleCloseModal}
          bgColor="bg-blue-600"
        />
      </div>
    </MainLayout>
  );
}

export default CreateProgramPage;
