import BackButton from "../../shared/components/navigation/BackButton";
import StageCard from "./StageCard";

interface Stage {
  id: string;
  numero: number;
  nombre: string;
  descripcion?: string;
  estado: "sin configurar" | "configurada" | "activa" | "cerrada";
  formularioConfigurado: boolean;
  postulaciones?: number;
  fechaCierre?: string;
}

interface StagesManagementProps {
  programName: string;
  programDescription?: string;
  stages?: Stage[];
  onEditForm?: (stageId: string) => void;
  onPublishStage?: (stageId: string) => void;
  onViewPostulaciones?: (stageId: string) => void;
  onCloseStage?: (stageId: string) => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonTo?: string;
}

export default function StagesManagement({
  programName,
  programDescription,
  stages = [],
  onEditForm,
  onPublishStage,
  onViewPostulaciones,
  onCloseStage,
  showBackButton = false,
  backButtonLabel = "Volver",
  backButtonTo,
}: StagesManagementProps) {
  // Mock data - Solo la primera etapa
  const defaultStages: Stage[] = [
    {
      id: "1",
      numero: 1,
      nombre: "Inscripción",
      descripcion: "Configura el formulario de inscripción",
      estado: "sin configurar",
      formularioConfigurado: false,
    },
  ];

  const stagesData = stages.length > 0 ? stages : defaultStages;

  return (
    <div className="w-full">
      {/* Back Button */}
      {showBackButton && (
        <BackButton label={backButtonLabel} to={backButtonTo} />
      )}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{programName}</h1>
            {programDescription && (
              <p className="text-gray-600 mt-2">{programDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stages Management Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de etapas</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Configura cada etapa del programa. Cada etapa debe ser publicada para que los usuarios puedan postularse.
        </p>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        {stagesData.map((stage) => (
          <StageCard
            key={stage.id}
            stageNumber={stage.numero}
            name={stage.nombre}
            description={stage.descripcion}
            status={stage.estado}
            isFormConfigured={stage.formularioConfigurado}
            postulaciones={stage.postulaciones}
            closingDate={stage.fechaCierre}
            onEditForm={() => onEditForm?.(stage.id)}
            onPublish={() => onPublishStage?.(stage.id)}
            onViewPostulaciones={() => onViewPostulaciones?.(stage.id)}
            onCloseStage={() => onCloseStage?.(stage.id)}
          />
        ))}
      </div>

      {/* Info Message */}
      {stagesData.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">No hay etapas configuradas para este programa</p>
        </div>
      )}
    </div>
  );
}
