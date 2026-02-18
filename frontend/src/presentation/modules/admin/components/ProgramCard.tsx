import type { ReactNode } from "react";

interface ProgramCardProps {
  title: string;
  description: string;
  status: "Activo" | "Borrador" | "Inhabilitado";
  stage: string;
  entity: string;
  programCode: string;
  children: ReactNode;
  borderColor: string;
  statusBgColor: string;
  statusColor: string;
  statusDot: string;
}

function ProgramCard({
  title,
  description,
  status,
  stage,
  entity,
  programCode,
  children,
  borderColor,
  statusBgColor,
  statusColor,
  statusDot,
}: ProgramCardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md border-2 ${borderColor}`}
      style={{ borderStyle: "dashed" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusDot}`}></span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusBgColor} ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold">Etapa</span>
          <span>{stage}</span>
        </div>
        <div>
          <p className="text-gray-600">Entidad responsable</p>
          <p className="font-semibold">{entity}</p>
        </div>
        <div>
          <p className="text-gray-600">Código del programa</p>
          <p className="font-semibold">{programCode}</p>
        </div>
      </div>

      <div className="flex gap-3">{children}</div>
    </div>
  );
}

export default ProgramCard;
