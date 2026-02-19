import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../shared/components/modals/ConfirmDialog";
import type { ProgramaResponse } from "../../../../infraestructure/api";
import { useDeletePrograma } from "../../../../infraestructure/hooks";

interface ProgramActionModalProps {
  isOpen: boolean;
  program: ProgramaResponse | null;
  onClose: () => void;
}

/**
 * Modal para editar y eliminar programas
 * Proporciona opciones para editar detalles o eliminar el programa
 */
function ProgramActionModal({ isOpen, program, onClose }: ProgramActionModalProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deletePrograma = useDeletePrograma();

  if (!isOpen || !program) return null;

  const handleEdit = () => {
    navigate(`/programas/${program.id}/editar`, { state: { program } });
    onClose();
  };

  const handleDelete = async () => {
    deletePrograma.mutate(program.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        onClose();
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{program.nombre}</h2>
          <p className="text-gray-600 text-sm mb-6">{program.codigo_programa}</p>

          <div className="space-y-3">
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition"
            >
              <span className="text-xl">✏️</span>
              Editar Programa
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition"
            >
              <span className="text-xl">🗑️</span>
              Eliminar Programa
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Programa"
        message={`¿Estás completamente seguro de que deseas eliminar el programa "${program.nombre}"? Esta acción no se puede deshacer y se perderán todos sus datos.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={deletePrograma.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

export default ProgramActionModal;
