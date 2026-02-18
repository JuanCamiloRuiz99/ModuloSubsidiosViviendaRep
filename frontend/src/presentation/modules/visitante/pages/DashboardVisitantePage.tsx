import MainLayout from "../../shared/components/layout/MainLayout";
import { SectionCard, TimelineStep, InfoCard } from "../../shared/components/cards";

function DashboardVisitantePage() {
  return (
    <MainLayout centerContent={false}>
      <div className="w-full max-w-6xl">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Portal del Visitante</h1>
          <p className="text-gray-600 mt-2">Consulta tu solicitud de subsidio de vivienda</p>
        </div>

        {/* Estado de la solicitud */}
        <SectionCard title="" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tu Solicitud</h2>
              <p className="text-gray-600">Número de radicado: <span className="font-semibold">SUB-2026-001254</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Estado actual:</p>
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                EN REVISIÓN
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Timeline del proceso */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TimelineStep
            icon="✓"
            label="Recibida"
            date="10/02/2026"
            bgColor="bg-green-500"
            textColor="text-white"
          />
          <TimelineStep
            icon="↻"
            label="En Revisión"
            date="Actualmente aquí"
            bgColor="bg-blue-500"
            textColor="text-white"
            isActive={true}
          />
          <TimelineStep
            icon="→"
            label="Resultado"
            date="Próxima etapa"
            bgColor="bg-gray-300"
            textColor="text-gray-600"
          />
        </div>

        {/* Información detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información personal */}
          <InfoCard title="Información Personal">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-semibold">Juan Pérez García</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cédula:</span>
                <span className="font-semibold">12345678910</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">juan@email.com</span>
              </div>
            </div>
          </InfoCard>

          {/* Documentos */}
          <InfoCard title="Documentos Cargados">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="font-semibold">Cédula de ciudadanía</p>
                  <p className="text-gray-500 text-xs">Cargado: 10/02/2026</p>
                </div>
                <span className="text-green-600 text-lg">✓</span>
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  <p className="font-semibold">Comprobante de ingresos</p>
                  <p className="text-gray-500 text-xs">Cargado: 11/02/2026</p>
                </div>
                <span className="text-green-600 text-lg">✓</span>
              </li>
            </ul>
          </InfoCard>
        </div>

        {/* Sección de contacto */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-3">¿Necesitas Ayuda?</h2>
          <p className="text-gray-600 mb-4">
            Si tienes dudas sobre tu solicitud, contacta con nosotros:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition">
              📞 Llamar al Centro de Atención
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition">
              💬 Enviar Mensaje
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default DashboardVisitantePage;
