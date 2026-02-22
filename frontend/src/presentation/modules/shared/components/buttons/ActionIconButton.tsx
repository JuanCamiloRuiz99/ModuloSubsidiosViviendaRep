interface ActionIconButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  tooltip?: string;
  className?: string;
}

/**
 * Botón de icono flotante para acciones rápidas
 * Se usa para acciones como editar, eliminar, configurar, etc.
 */
function ActionIconButton({
  onClick,
  icon,
  label,
  tooltip,
  className = "",
}: ActionIconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip || label}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ${className}`}
      aria-label={label}
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}

export default ActionIconButton;
