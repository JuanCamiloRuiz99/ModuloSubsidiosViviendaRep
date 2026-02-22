/**
 * Icono Chevron reutilizable
 */
interface ChevronIconProps {
  rotated?: boolean;
}

function ChevronIcon({ rotated = false }: ChevronIconProps) {
  return (
    <svg
      className={`w-5 h-5 ${rotated ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  );
}

export default ChevronIcon;
