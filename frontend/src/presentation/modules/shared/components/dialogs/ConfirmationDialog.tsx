/**
 * Componente ConfirmationDialog
 * Diálogo reutilizable para confirmar acciones destructivas o importantes
 * 
 * Sigue principios SOLID:
 * - Single Responsibility: solo maneja la UI de confirmación
 * - Open/Closed: extensible mediante props
 * - Dependency Inversion: depende de props, no de implementaciones específicas
 */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDangerous = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  const confirmButtonColor = isDangerous
    ? "bg-red-600 hover:bg-red-700"
    : "bg-yellow-500 hover:bg-yellow-600";

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onCancel}>
      <AlertDialog.Content className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg">
        <AlertDialog.Title
          className={`text-lg font-bold ${
            isDangerous ? "text-red-600" : "text-gray-800"
          }`}
        >
          {title}
        </AlertDialog.Title>

        {description && (
          <AlertDialog.Description className="text-gray-600 mt-3">
            {description}
          </AlertDialog.Description>
        )}

        <div className="flex gap-3 mt-6">
          <AlertDialog.Cancel
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </AlertDialog.Cancel>

          <AlertDialog.Action
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${confirmButtonColor} text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
