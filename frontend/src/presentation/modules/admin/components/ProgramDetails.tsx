import { useState } from "react";
import StatusFilter from "../../shared/components/filters/StatusFilter";
import ProgramCard from "./ProgramCard";

interface Program {
  id: string;
  title: string;
  description: string;
  status: "Activo" | "Borrador" | "Inhabilitado";
  stage: string;
  entity: string;
  programCode: string;
}

function ProgramDetails() {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  // Mock data
  const programs: Program[] = [
    {
      id: "1",
      title: "Mi casa Ya!!",
      description: "Breve descripción",
      status: "Activo",
      stage: "Etapa 1",
      entity: "Entidad responsable\nCódigo del programa",
      programCode: "PROG-001",
    },
    {
      id: "2",
      title: "Nombre del Programa",
      description: "Breve descripción",
      status: "Borrador",
      stage: "Etapa 1",
      entity: "Entidad responsable",
      programCode: "Código del programa",
    },
    {
      id: "3",
      title: "Programa 3",
      description: "Ejemplo de programa activo",
      status: "Activo",
      stage: "Etapa 2",
      entity: "Entidad A",
      programCode: "PROG-003",
    },
    {
      id: "4",
      title: "Programa 4",
      description: "Ejemplo de borrador",
      status: "Borrador",
      stage: "Etapa 1",
      entity: "Entidad B",
      programCode: "PROG-004",
    },
    {
      id: "5",
      title: "Programa 5",
      description: "Programa inhabilitado",
      status: "Inhabilitado",
      stage: "Etapa 3",
      entity: "Entidad C",
      programCode: "PROG-005",
    },
  ];

  const statusOptions = [
    { label: "Todos", count: programs.length, id: "todos" },
    {
      label: "Activos",
      count: programs.filter((p) => p.status === "Activo").length,
      id: "activos",
    },
    {
      label: "Borradores",
      count: programs.filter((p) => p.status === "Borrador").length,
      id: "borradores",
    },
    {
      label: "Inhabitilitados",
      count: programs.filter((p) => p.status === "Inhabilitado").length,
      id: "inhabitilitados",
    },
  ];

  const filteredPrograms = programs.filter((program) => {
    if (!activeStatus || activeStatus === "todos") return true;
    if (activeStatus === "activos") return program.status === "Activo";
    if (activeStatus === "borradores") return program.status === "Borrador";
    if (activeStatus === "inhabitilitados")
      return program.status === "Inhabilitado";
    return true;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Activo":
        return {
          borderColor: "border-green-500",
          statusBgColor: "bg-green-100",
          statusColor: "text-green-800",
          statusDot: "bg-green-500",
        };
      case "Borrador":
        return {
          borderColor: "border-yellow-500",
          statusBgColor: "bg-yellow-100",
          statusColor: "text-yellow-800",
          statusDot: "bg-yellow-500",
        };
      case "Inhabilitado":
        return {
          borderColor: "border-red-500",
          statusBgColor: "bg-red-100",
          statusColor: "text-red-800",
          statusDot: "bg-red-500",
        };
      default:
        return {
          borderColor: "border-gray-500",
          statusBgColor: "bg-gray-100",
          statusColor: "text-gray-800",
          statusDot: "bg-gray-500",
        };
    }
  };

  return (
    <div>
      <StatusFilter
        statuses={statusOptions}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((program) => {
          const styles = getStatusStyles(program.status);
          return (
            <ProgramCard
              key={program.id}
              title={program.title}
              description={program.description}
              status={program.status}
              stage={program.stage}
              entity={program.entity}
              programCode={program.programCode}
              borderColor={styles.borderColor}
              statusBgColor={styles.statusBgColor}
              statusColor={styles.statusColor}
              statusDot={styles.statusDot}
            >
              {program.status === "Activo" && (
                <>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2">
                    ⚙ Gestionar Etapas
                  </button>
                  <button className="flex-1 bg-red-400 hover:bg-red-500 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2">
                    ⏹ Inhabilitar
                  </button>
                </>
              )}
              {program.status === "Borrador" && (
                <>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2">
                    ⚙ Gestionar Etapas
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2">
                    ▶ Publicar
                  </button>
                </>
              )}
              {program.status === "Inhabilitado" && (
                <button className="w-full bg-gray-400 text-white py-2 rounded font-semibold cursor-not-allowed">
                  Inhabilitado
                </button>
              )}
            </ProgramCard>
          );
        })}
      </div>
    </div>
  );
}

export default ProgramDetails;
