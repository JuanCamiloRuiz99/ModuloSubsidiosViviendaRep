interface StatusFilterProps {
  statuses: { label: string; count: number; id: string }[];
  activeStatus: string;
  onStatusChange: (statusId: string) => void;
  label?: string;
}

function StatusFilter({
  statuses,
  activeStatus,
  onStatusChange,
  label = "Filtrar por estado:",
}: StatusFilterProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <p className="text-gray-800 font-semibold mb-4">{label}</p>
      <div className="flex flex-wrap gap-3">
        {statuses.map((status) => (
          <button
            key={status.id}
            onClick={() => onStatusChange(status.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeStatus === status.id
                ? `ring-2 ring-offset-2 ${getStatusStyles(status.id).activeBg}`
                : `${getStatusStyles(status.id).bg} ${getStatusStyles(status.id).text}`
            }`}
          >
            {status.label} ({status.count})
          </button>
        ))}
      </div>
    </div>
  );
}

function getStatusStyles(statusId: string) {
  const styles: Record<
    string,
    { bg: string; text: string; activeBg: string }
  > = {
    todos: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      activeBg: "ring-blue-500 bg-blue-100",
    },
    activos: {
      bg: "bg-green-100",
      text: "text-green-800",
      activeBg: "ring-green-500 bg-green-100",
    },
    borradores: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      activeBg: "ring-yellow-500 bg-yellow-100",
    },
    inhabilitados: {
      bg: "bg-red-100",
      text: "text-red-800",
      activeBg: "ring-red-500 bg-red-100",
    },
  };
  return styles[statusId] || styles.todos;
}

export default StatusFilter;
