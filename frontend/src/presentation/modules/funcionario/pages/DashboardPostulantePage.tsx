import MainLayout from "../../shared/components/layout/MainLayout";
import { StatCard, SectionCard } from "../../shared/components/cards";

function DashboardPostulantePage() {
  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel del Funcionario</h1>
          <p className="text-gray-600 mt-2">Revisa y procesa las solicitudes de subsidios</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Solicitudes a Revisar"
            value="24"
            description="Esperando tu revisión"
            borderColor="border-indigo-500"
            textColor="text-indigo-600"
          />
          <StatCard
            title="Procesadas Este Mes"
            value="156"
            description="Solicitudes completadas"
            borderColor="border-green-500"
            textColor="text-green-600"
          />
          <StatCard
            title="Mi Desempeño"
            value="94%"
            description="Precisión en revisión"
            borderColor="border-purple-500"
            textColor="text-purple-600"
          />
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solicitudes pendientes */}
          <SectionCard title="Solicitudes Pendientes" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-2 px-3 text-gray-600">Solicitante</th>
                    <th className="text-left py-2 px-3 text-gray-600">Estado</th>
                    <th className="text-left py-2 px-3 text-gray-600">Fecha</th>
                    <th className="text-center py-2 px-3 text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">Juan García López</td>
                    <td className="py-3 px-3">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        PENDIENTE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">18/02/2026</td>
                    <td className="py-3 px-3 text-center">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition">
                        Revisar
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3">María Rodríguez</td>
                    <td className="py-3 px-3">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        PENDIENTE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">17/02/2026</td>
                    <td className="py-3 px-3 text-center">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition">
                        Revisar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition">
              Ver Todas las Solicitudes
            </button>
          </SectionCard>

          {/* Atajos y acciones */}
          <SectionCard title="Acciones Rápidas" className="h-fit">
            <ul className="space-y-3">
              <li>
                <button className="w-full text-left bg-indigo-50 hover:bg-indigo-100 p-3 rounded transition text-indigo-700 font-semibold">
                  ➜ Crear Reporte
                </button>
              </li>
              <li>
                <button className="w-full text-left bg-indigo-50 hover:bg-indigo-100 p-3 rounded transition text-indigo-700 font-semibold">
                  ➜ Ver Historial
                </button>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </MainLayout>
  );
}

export default DashboardPostulantePage;
