interface StageCardProps {
  stageNumber: number;
  name: string;
  description?: string;
  status: "configurada" | "activa" | "cerrada";
  isFormConfigured?: boolean;
  postulaciones?: number;
  closingDate?: string;
  onEditForm?: () => void;
  onPublish?: () => void;
  onViewPostulaciones?: () => void;
  onCloseStage?: () => void;
}

export default function StageCard({
  stageNumber,
  name,
  description,
  status,
  isFormConfigured,
  postulaciones,
  closingDate,
  onEditForm,
  onPublish,
  onViewPostulaciones,
  onCloseStage,
}: StageCardProps) {
  const statusConfig = {
    configurada: {
      label: "Configurado",
      badgeColor: "bg-yellow-100 text-yellow-800",
      borderColor: "border-yellow-300",
      icon: "⏱️",
    },
    activa: {
      label: "Activo",
      badgeColor: "bg-green-100 text-green-800",
      borderColor: "border-green-300",
      icon: "✅",
    },
    cerrada: {
      label: "Cerrada",
      badgeColor: "bg-gray-100 text-gray-800",
      borderColor: "border-gray-300",
      icon: "❌",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`border-l-4 ${config.borderColor} bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <span className="text-3xl">{config.icon}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Etapa {stageNumber}: {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${config.badgeColor}`}>
          {config.label}
        </span>
      </div>

      {/* Content */}
      {status === "configurada" && !isFormConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-yellow-800">
            Un formulario ya ha sido configurado
          </p>
        </div>
      )}

      {status === "activa" && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Postulaciones</p>
              <p className="text-lg font-bold text-blue-800">{postulaciones || 0}</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-purple-600 font-semibold">Fecha de cierre</p>
              <p className="text-sm font-bold text-purple-800">{closingDate || "N/A"}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-semibold mb-1">Estado</p>
            <p className="text-sm font-bold text-gray-800">En progreso</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {status === "configurada" && (
          <>
            <button
              onClick={onEditForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
            >
              ✏️ Editar Formulario
            </button>
            <button
              onClick={onPublish}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
            >
              📤 Publicar Etapa
            </button>
          </>
        )}

        {status === "activa" && (
          <>
            <button
              onClick={onViewPostulaciones}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              👁️ Ver postulaciones
            </button>
            <button
              onClick={onCloseStage}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
            >
              ✖️ Cerrar Etapa
            </button>
          </>
        )}
      </div>
    </div>
  );
}
