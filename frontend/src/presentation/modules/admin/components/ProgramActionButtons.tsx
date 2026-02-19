import type { ProgramaResponse } from "../../../../infraestructure/api";

interface ProgramActionButtonsProps {
  program: ProgramaResponse;
  isPending: boolean;
  onNavigateToStages: (programId: number) => void;
  onDisable: (program: ProgramaResponse) => void;
  onEnable: (program: ProgramaResponse) => void;
}

/**
 * Renderiza los botones de acción según el estado del programa
 * Reduce la repetición de código en ProgramDetails
 */
function ProgramActionButtons({
  program,
  isPending,
  onNavigateToStages,
  onDisable,
  onEnable,
}: ProgramActionButtonsProps) {
  if (program.estado === "ACTIVO") {
    return (
      <>
        <button
          onClick={() => onNavigateToStages(program.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
        >
          ⚙ Gestionar Etapas
        </button>
        <button
          onClick={() => onDisable(program)}
          disabled={isPending}
          className="flex-1 bg-red-400 hover:bg-red-500 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
        >
          ⏹ Inhabilitar
        </button>
      </>
    );
  }

  if (program.estado === "BORRADOR") {
    return (
      <>
        <button
          onClick={() => onNavigateToStages(program.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
        >
          ⚙ Gestionar Etapas
        </button>
        <button
          disabled={true}
          className="flex-1 bg-gray-400 text-white py-2 rounded font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          ▶ Publicar
        </button>
      </>
    );
  }

  if (program.estado === "INHABILITADO") {
    return (
      <button
        onClick={() => onEnable(program)}
        disabled={isPending}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
      >
        ✓ Rehabilitar
      </button>
    );
  }

  return null;
}

export default ProgramActionButtons;
