import type { ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: ReactNode;
  buttonText?: string;
  onClose: () => void;
  bgColor?: string;
}

function ConfirmationModal({
  isOpen,
  title,
  message,
  icon,
  buttonText = "Ir a configuración",
  onClose,
  bgColor = "bg-blue-600",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} text-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4`}>
        <div className="flex items-center justify-center mb-4">
          {icon ? (
            icon
          ) : (
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">ℹ</span>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
        <p className="text-center text-white text-opacity-90 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-white text-gray-800 font-semibold py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
