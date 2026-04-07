/**
 * DashboardPage — Panel principal del administrador.
 * Módulo en construcción.
 */

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 7a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zM4 14a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-600 mb-2">Panel de administración</h2>
      <p className="text-sm">Este módulo se encuentra en construcción.</p>
    </div>
  );
}
