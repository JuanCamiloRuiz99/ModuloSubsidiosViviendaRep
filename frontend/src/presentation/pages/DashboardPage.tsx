/**
 * DashboardPage — Panel principal con estadísticas globales del sistema.
 */

import { useQuery } from '@tanstack/react-query';
import apiService from '../../core/services/api.service';
import { HeaderPanel } from '../../shared/presentation/components';

interface DashboardData {
  programas: { total: number; por_estado: Record<string, number> };
  etapas: { total: number; activas: number; finalizadas: number };
  postulaciones: { total: number; por_estado: Record<string, number> };
  visitas: { total: number; por_estado: Record<string, number>; efectivas: number; no_efectivas: number };
  usuarios: { total: number; activos: number; por_rol: Record<string, number> };
  hogares: { total: number; por_estrato: Record<string, number>; por_zona: Record<string, number> };
  miembros: { total: number; vulnerabilidad: Record<string, number> };
  documentos_internos: number;
}

const ESTADO_POST_LABELS: Record<string, string> = {
  REGISTRADA: 'Registrada',
  EN_REVISION: 'En revisión',
  SUBSANACION: 'Subsanación',
  VISITA_PENDIENTE: 'Visita pendiente',
  VISITA_PROGRAMADA: 'Visita programada',
  VISITA_REALIZADA: 'Visita realizada',
  DOCUMENTOS_INCOMPLETOS: 'Docs. incompletos',
  DOCUMENTOS_CARGADOS: 'Docs. cargados',
  BENEFICIADO: 'Beneficiado',
  NO_BENEFICIARIO: 'No beneficiario',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

const ESTADO_POST_COLORS: Record<string, string> = {
  REGISTRADA: 'bg-blue-500',
  EN_REVISION: 'bg-yellow-500',
  SUBSANACION: 'bg-orange-500',
  VISITA_PENDIENTE: 'bg-cyan-500',
  VISITA_PROGRAMADA: 'bg-blue-500',
  VISITA_REALIZADA: 'bg-teal-500',
  DOCUMENTOS_INCOMPLETOS: 'bg-red-400',
  DOCUMENTOS_CARGADOS: 'bg-emerald-500',
  BENEFICIADO: 'bg-green-600',
  NO_BENEFICIARIO: 'bg-rose-500',
  APROBADA: 'bg-green-500',
  RECHAZADA: 'bg-red-600',
};

const ROL_LABELS: Record<string, string> = {
  '1': 'Administradores',
  '2': 'Funcionarios',
  '3': 'Técnicos',
};

const VULN_LABELS: Record<string, string> = {
  discapacidad: 'Discapacidad',
  victima: 'Víctimas',
  desplazado: 'Desplazados',
  firmante_paz: 'Firmantes de paz',
};

/* ─── Componentes auxiliares ─── */

function StatCard({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
      </div>
    </div>
  );
}

function MiniBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-32 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DonutStat({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="text-gray-600">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{item.value}</span>
            <span className="text-gray-400">{total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Página principal ─── */

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'estadisticas'],
    queryFn: async () => {
      const { data } = await apiService.get<DashboardData>('dashboard/estadisticas/');
      return data;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-center">
          <p className="text-red-700 font-medium">Error al cargar las estadísticas</p>
          <p className="text-red-500 text-sm mt-1">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      </div>
    );
  }

  const { programas, etapas, postulaciones, visitas, usuarios, hogares, miembros, documentos_internos } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPanel
        title="Panel de estadísticas"
        subtitle="Resumen general del sistema de subsidios de vivienda"
      />

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Programas"
          value={programas.total}
          color="bg-blue-100 text-blue-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard
          title="Postulaciones"
          value={postulaciones.total}
          color="bg-emerald-100 text-emerald-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          title="Visitas"
          value={visitas.total}
          color="bg-cyan-100 text-cyan-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          title="Hogares registrados"
          value={hogares.total}
          color="bg-amber-100 text-amber-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        />
        <StatCard
          title="Usuarios"
          value={usuarios.total}
          color="bg-violet-100 text-violet-700"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
      </div>

      {/* ═══ Row 2: Programas + Postulaciones ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programas por estado */}
        <SectionCard title="Programas por estado">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'ACTIVO', label: 'Activos', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
              { key: 'BORRADOR', label: 'Borradores', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
              { key: 'INHABILITADO', label: 'Inhabilitados', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
              { key: 'CULMINADO', label: 'Culminados', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
            ].map((e) => (
              <div key={e.key} className={`${e.bgColor} rounded-lg p-3 text-center`}>
                <p className={`text-xl font-bold ${e.textColor}`}>{programas.por_estado[e.key] ?? 0}</p>
                <p className="text-xs text-gray-500">{e.label}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Pipeline postulaciones */}
        <SectionCard title="Postulaciones por estado">
          <div className="space-y-2.5">
            {Object.entries(ESTADO_POST_LABELS).map(([key, label]) => {
              const val = postulaciones.por_estado[key] ?? 0;
              if (val === 0 && postulaciones.total === 0) return null;
              return (
                <MiniBar key={key} label={label} value={val} total={postulaciones.total} color={ESTADO_POST_COLORS[key] ?? 'bg-gray-400'} />
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ═══ Row 3: Visitas + Usuarios ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitas */}
        <SectionCard title="Visitas técnicas">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Efectivas</span>
              <span className="text-sm font-bold text-green-600">{visitas.efectivas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">No efectivas</span>
              <span className="text-sm font-bold text-red-500">{visitas.no_efectivas}</span>
            </div>
            <hr className="border-gray-100" />
            <DonutStat
              total={visitas.total}
              items={[
                { label: 'Programadas', value: visitas.por_estado['PROGRAMADA'] ?? 0, color: 'bg-blue-400' },
                { label: 'Realizando', value: visitas.por_estado['REALIZANDO'] ?? 0, color: 'bg-yellow-400' },
                { label: 'Completadas', value: visitas.por_estado['COMPLETADA'] ?? 0, color: 'bg-green-500' },
                { label: 'Canceladas', value: visitas.por_estado['CANCELADA'] ?? 0, color: 'bg-red-400' },
              ]}
            />
          </div>
        </SectionCard>

        {/* Usuarios */}
        <SectionCard title="Usuarios del sistema">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Activos</span>
              <span className="text-sm font-bold text-green-600">{usuarios.activos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Inactivos</span>
              <span className="text-sm font-bold text-gray-400">{usuarios.total - usuarios.activos}</span>
            </div>
            <hr className="border-gray-100" />
            <DonutStat
              total={usuarios.total}
              items={Object.entries(ROL_LABELS).map(([key, label]) => ({
                label,
                value: usuarios.por_rol[key] ?? 0,
                color: key === '1' ? 'bg-violet-500' : key === '2' ? 'bg-blue-500' : 'bg-teal-500',
              }))}
            />
          </div>
        </SectionCard>
      </div>

      {/* ═══ Row 4: Hogares + Vulnerabilidad + Etapas ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hogares por zona */}
        <SectionCard title="Hogares por zona">
          <div className="space-y-2.5">
            {Object.entries(hogares.por_zona).length > 0 ? (
              Object.entries(hogares.por_zona).map(([zona, count]) => (
                <MiniBar key={zona} label={zona || 'Sin definir'} value={count as number} total={hogares.total} color="bg-amber-500" />
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-3">Sin datos de zona</p>
            )}
          </div>
        </SectionCard>

        {/* Vulnerabilidad */}
        <SectionCard title="Población vulnerable (miembros)">
          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900">{miembros.total}</p>
            <p className="text-xs text-gray-400">Miembros de hogar registrados</p>
          </div>
          <DonutStat
            total={miembros.total}
            items={Object.entries(VULN_LABELS).map(([key, label]) => ({
              label,
              value: miembros.vulnerabilidad[key] ?? 0,
              color: key === 'discapacidad' ? 'bg-purple-500' : key === 'victima' ? 'bg-red-500' : key === 'desplazado' ? 'bg-orange-500' : 'bg-teal-500',
            }))}
          />
        </SectionCard>

        {/* Etapas + Documentos */}
        <SectionCard title="Etapas y documentos">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{etapas.activas}</p>
                <p className="text-xs text-gray-500">Etapas activas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-600">{etapas.finalizadas}</p>
                <p className="text-xs text-gray-500">Finalizadas</p>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Documentos internos</span>
              <span className="text-sm font-bold text-gray-700">{documentos_internos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total etapas</span>
              <span className="text-sm font-bold text-gray-700">{etapas.total}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ═══ Row 5: Estrato ═══ */}
      {Object.keys(hogares.por_estrato).length > 0 && (
        <SectionCard title="Hogares por estrato socioeconómico">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((e) => (
              <div key={e} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-700">{hogares.por_estrato[String(e)] ?? 0}</p>
                <p className="text-xs text-gray-500">Estrato {e}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
