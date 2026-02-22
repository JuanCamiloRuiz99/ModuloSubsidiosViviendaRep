/**
 * Componente de modal de confirmación reutilizable usando Radix UI
 * Se utiliza para mostrar mensajes informativos con confirmación
 */
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: ReactNode;
  buttonText?: string;
  onClose: () => void;
  bgColor?: string;
}

/**
 * Componente de modal de confirmación usando Radix UI Dialog
 * Proporciona accesibilidad mejorada y mejor UX
 */
function ConfirmationModal({
  isOpen,
  title,
  message,
  icon,
  buttonText = "Ir a configuración",
  onClose,
  bgColor = "bg-blue-600",
}: ConfirmationModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 animate-in fade-in-0 z-50" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md ${bgColor} text-white p-8 rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]`}>
          <div className="flex items-center justify-center mb-4">
            {icon ? (
              icon
            ) : (
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">ℹ</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            {title}
          </h2>
          <Dialog.Description className="text-center text-white text-opacity-90 mb-6">
            {message}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-800 font-semibold py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              {buttonText}
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConfirmationModal;
