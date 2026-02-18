import MainLayout from "../../shared/components/layout/MainLayout";
import { StatCard, SectionCard } from "../../shared/components/cards";

function DashboardAdminPage() {
  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrador</h1>
          <p className="text-gray-600 mt-2">Bienvenido, aquí puedes gestionar todo el sistema</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Postulantes Totales"
            value="1,240"
            description="Todos los registrados"
            borderColor="border-blue-500"
            textColor="text-blue-600"
          />
          <StatCard
            title="Aprobados"
            value="456"
            description="Solicitudes aprobadas"
            borderColor="border-green-500"
            textColor="text-green-600"
          />
          <StatCard
            title="Pendientes"
            value="320"
            description="Requieren revisión"
            borderColor="border-yellow-500"
            textColor="text-yellow-600"
          />
          <StatCard
            title="Rechazados"
            value="89"
            description="No cumplen requisitos"
            borderColor="border-red-500"
            textColor="text-red-600"
          />
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen */}
          <SectionCard title="Resumen">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="pb-2 border-b">📊 Total de solicitudes: 1,240</li>
              <li className="pb-2 border-b">✓ Aprobadas: 456 (37%)</li>
              <li className="pb-2 border-b">⏳ Pendientes: 320 (26%)</li>
              <li>❌ Rechazadas: 89 (7%)</li>
            </ul>
          </SectionCard>

          {/* Actividad reciente */}
          <SectionCard title="Actividad Reciente">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="pb-2 border-b">📋 Nueva solicitud de Juan García</li>
              <li className="pb-2 border-b">✓ María López aprobada</li>
              <li className="pb-2 border-b">📊 Reporte mensual generado</li>
              <li>👤 Usuario visitante registrado</li>
            </ul>
          </SectionCard>

          {/* Tareas pendientes */}
          <SectionCard title="Tareas Pendientes">
            <ul className="space-y-2 text-sm">
              <li className="pb-2 border-b">
                <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Urgente</span>
                <p>Revisar 15 solicitudes</p>
              </li>
              <li className="pb-2 border-b">
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Normal</span>
                <p>Aprobar documentos</p>
              </li>
              <li>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Info</span>
                <p>Actualizar base de datos</p>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </MainLayout>
  );
}

export default DashboardAdminPage;
