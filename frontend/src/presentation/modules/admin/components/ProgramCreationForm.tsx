import { useCreatePrograma } from "../../../../infraestructure/hooks";
import ProgramForm from "../../shared/components/form/ProgramForm";
import type { ProgramFormData } from "../schemas/programSchema";

interface ProgramCreationFormProps {
  onSuccess: (programCode: string) => void;
}

function ProgramCreationForm({ onSuccess }: ProgramCreationFormProps) {
  const createMutation = useCreatePrograma();

  const handleSubmit = (data: ProgramFormData) => {
    createMutation.mutate(
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        entidad_responsable: data.entidadResponsable,
      },
      {
        onSuccess: (response) => {
          onSuccess(response.codigo_programa);
        },
      }
    );
  };

  return (
    <ProgramForm
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
      note='* El programa se creará automáticamente con el estado "borrador"'
    />
  );
}

export default ProgramCreationForm;
