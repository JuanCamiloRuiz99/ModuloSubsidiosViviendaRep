import { useUpdatePrograma } from "../../../../infraestructure/hooks";
import ProgramForm from "../../shared/components/form/ProgramForm";
import type { ProgramaResponse } from "../../../../infraestructure/api";
import type { ProgramFormData } from "../schemas/programSchema";

interface ProgramEditFormProps {
  program: ProgramaResponse;
  onSuccess: () => void;
}

function ProgramEditForm({ program, onSuccess }: ProgramEditFormProps) {
  const updateMutation = useUpdatePrograma(program.id);

  const handleSubmit = (data: ProgramFormData) => {
    updateMutation.mutate(
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        entidad_responsable: data.entidadResponsable,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <ProgramForm
      mode="edit"
      initialData={{
        nombre: program.nombre,
        descripcion: program.descripcion,
        entidadResponsable: program.entidad_responsable,
        codigoPrograma: program.codigo_programa,
        estado: program.estado,
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
      showWarning
    />
  );
}

export default ProgramEditForm;
