import type { ReactNode } from "react";
import ActionIconButton from "../../shared/components/buttons/ActionIconButton";

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  status: "Activo" | "Borrador" | "Inhabilitado";
  entity: string;
  programCode: string;
  children: ReactNode;
  borderColor: string;
  statusBgColor: string;
  statusColor: string;
  statusDot: string;
  onActionClick?: () => void;
}

/**
 * Tarjeta de programa reutilizable
 * Muestra información del programa con estado, entidad y código
 * Soporta acciones personalizadas mediante children
 */
function ProgramCard({
  title,
  description,
  status,
  entity,
  programCode,
  children,
  borderColor,
  statusBgColor,
  statusColor,
  statusDot,
  onActionClick,
}: ProgramCardProps) {
  return (
    <div
      className={`relative bg-white p-6 rounded-lg shadow-md border-2 ${borderColor} hover:shadow-md transition`}
      style={{ borderStyle: "dashed" }}
    >
      {/* Icono de acción en esquina superior derecha */}
      {onActionClick && (
        <div className="absolute top-4 right-4">
          <ActionIconButton
            onClick={onActionClick}
            icon="🔧"
            label="Editar o eliminar programa"
            tooltip="Editar o eliminar este programa"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-12">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`w-3 h-3 rounded-full ${statusDot}`}></span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusBgColor} ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm text-gray-700">
        <div>
          <p className="text-gray-600">Entidad responsable</p>
          <p className="font-semibold">{entity}</p>
        </div>
        <div>
          <p className="text-gray-600">Código del programa</p>
          <p className="font-semibold">{programCode}</p>
        </div>
      </div>

      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
}

export default ProgramCard;
