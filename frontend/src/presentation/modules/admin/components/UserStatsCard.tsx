/**
 * Componente UserStatsCard
 * Muestra estadísticas individuales de usuarios
 */

interface UserStatsCardProps {
  icon: string;
  label: string;
  value: number;
  valueLabel?: string;
  variant?: "total" | "activos" | "inactivos" | "role";
}

export default function UserStatsCard({
  icon,
  label,
  value,
  valueLabel,
  variant = "total",
}: UserStatsCardProps) {
  const variantStyles = {
    total: "bg-blue-50 border-blue-200",
    activos: "bg-green-50 border-green-200",
    inactivos: "bg-gray-50 border-gray-200",
    role: "bg-purple-50 border-purple-200",
  };

  const textStyles = {
    total: "text-blue-600",
    activos: "text-green-600",
    inactivos: "text-gray-600",
    role: "text-purple-600",
  };

  return (
    <div
      className={`border ${variantStyles[variant]} rounded-lg p-4 flex items-center gap-4`}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${textStyles[variant]}`}>{value}</p>
        {valueLabel && <p className="text-xs text-gray-500 mt-1">{valueLabel}</p>}
      </div>
    </div>
  );
}
