interface PostulantRequest {
  codigo: string;
  nombre: string;
  documento: string;
  programa: string;
  fecha: string;
  estado: "En Revisión" | "Subsanación" | "Aprobado" | "Rechazado";
}

interface PostulantsTableProps {
  postulants?: PostulantRequest[];
}

export default function PostulantsTable({ postulants = [] }: PostulantsTableProps) {
  // Mock data
  const defaultPostulants: PostulantRequest[] = [
    {
      codigo: "POP-12345678",
      nombre: "Juan Carlos Pérez García",
      documento: "1234567890",
      programa: "Vivienda Digna",
      fecha: "14/7/2026",
      estado: "En Revisión",
    },
    {
      codigo: "POP-87654321",
      nombre: "María López Rodríguez",
      documento: "9876543210",
      programa: "Mejoramiento Rural",
      fecha: "9/7/2026",
      estado: "Aprobado",
    },
    {
      codigo: "POP-45678901",
      nombre: "Carlos Andrés Ramírez Torres",
      documento: "4567890123",
      programa: "Vivienda Digna",
      fecha: "13/7/2026",
      estado: "Subsanación",
    },
  ];

  const data = postulants.length > 0 ? postulants : defaultPostulants;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "En Revisión":
        return "text-blue-600 bg-blue-50";
      case "Aprobado":
        return "text-green-600 bg-green-50";
      case "Subsanación":
        return "text-yellow-600 bg-yellow-50";
      case "Rechazado":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusEmoji = (estado: string) => {
    switch (estado) {
      case "En Revisión":
        return "🔍";
      case "Aprobado":
        return "✅";
      case "Subsanación":
        return "⚠️";
      case "Rechazado":
        return "❌";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                CÓDIGO
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                POSTULANTE
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                DOCUMENTO
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                PROGRAMA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                FECHA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ESTADO
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((postulant, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {postulant.codigo}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {postulant.nombre}
                  </div>
                  <div className="text-xs text-gray-500">{postulant.documento}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {postulant.documento}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {postulant.programa}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{postulant.fecha}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      postulant.estado
                    )}`}
                  >
                    {getStatusEmoji(postulant.estado)} {postulant.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold transition">
                      👁️ Ver Detalle
                    </button>
                    <button className="text-green-600 hover:text-green-800 font-semibold transition">
                      ✏️ Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {data.length} de {data.length} resultados
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            ←
          </button>
          <div className="flex items-center gap-1">
            <div className="w-full h-1 bg-gray-300 rounded"></div>
          </div>
          <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
