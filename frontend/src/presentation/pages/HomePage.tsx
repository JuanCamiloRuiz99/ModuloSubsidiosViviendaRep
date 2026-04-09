/**
 * HomePage — Página de inicio pública para ciudadanos.
 * Muestra un carrusel con TODOS los programas activos y enlaces a los formularios
 * de la Etapa 1 (REGISTRO_HOGAR) cuando están publicados.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';

// ── Tipos mínimos necesarios ──────────────────────────────────────────────── //

interface ProgramaPublico {
  id: number;
  nombre: string;
  descripcion?: string;
  entidad_responsable?: string;
  codigo_programa?: string;
  estado: string;
}

interface EtapaPublica {
  id: number;
  numero_etapa: number;
  modulo_principal: string;
  formulario_estado: 'BORRADOR' | 'PUBLICADO' | null;
  registro_hogar_publicado: boolean;
  visita_tecnica_publicado: boolean;
}

interface PostulacionEstado {
  numero_radicado: string;
  programa: string;
  estado: string;
  estado_label: string;
  fecha_postulacion: string;
  nombre_postulante: string;
}

// ── Helpers de fetch sin autenticación ───────────────────────────────────── //

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000/api';

async function fetchProgramasActivos(): Promise<ProgramaPublico[]> {
  const res = await fetch(`${API_BASE}/programas/?estado=ACTIVO`);
  if (!res.ok) return [];
  const data: unknown = await res.json();
  return Array.isArray(data)
    ? (data as ProgramaPublico[])
    : (((data as Record<string, unknown>)['results'] as ProgramaPublico[]) ?? []);
}

async function fetchEtapas(programaId: number): Promise<EtapaPublica[]> {
  const res = await fetch(`${API_BASE}/etapas/?programa=${programaId}`);
  if (!res.ok) return [];
  const data: unknown = await res.json();
  return Array.isArray(data)
    ? (data as EtapaPublica[])
    : (((data as Record<string, unknown>)['results'] as EtapaPublica[]) ?? []);
}

// ── Íconos inline (sin dependencias extra) ───────────────────────────────── //

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-alcaldia-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  // ── Estado para consulta de postulación ──
  const [cedulaConsulta, setCedulaConsulta] = useState('');
  const [consultaLoading, setConsultaLoading] = useState(false);
  const [consultaError, setConsultaError] = useState<string | null>(null);
  const [consultaResultados, setConsultaResultados] = useState<PostulacionEstado[] | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. Buscar TODOS los programas activos
  const programasQuery = useQuery({
    queryKey: ['public', 'programas-activos'],
    queryFn: fetchProgramasActivos,
    staleTime: 60_000,
    retry: 2,
  });

  const programas = programasQuery.data ?? [];

  // 2. Buscar etapas de cada programa en paralelo
  const etapasQueries = useQueries({
    queries: programas.map((p) => ({
      queryKey: ['public', 'etapas', p.id],
      queryFn: () => fetchEtapas(p.id),
      staleTime: 60_000,
      retry: 2,
      enabled: true,
    })),
  });

  // Construir mapa programa → etapa REGISTRO_HOGAR
  const etapasPorPrograma = new Map<number, EtapaPublica | null>();
  programas.forEach((p, i) => {
    const etapas = etapasQueries[i]?.data ?? [];
    const rh = etapas.find((e) => e.modulo_principal === 'REGISTRO_HOGAR') ?? null;
    etapasPorPrograma.set(p.id, rh);
  });

  const total = programas.length;

  // Mantener current dentro de rango si cambia el total
  useEffect(() => {
    if (total > 0 && current >= total) setCurrent(0);
  }, [total, current]);

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? total - 1 : c - 1)), [total]);
  const next = useCallback(() => setCurrent((c) => (c === total - 1 ? 0 : c + 1)), [total]);

  const isLoading =
    programasQuery.isLoading ||
    etapasQueries.some((q) => q.isLoading);

  // ── Consultar estado de postulación ──
  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedula = cedulaConsulta.trim();
    if (!cedula) return;

    setConsultaLoading(true);
    setConsultaError(null);
    setConsultaResultados(null);

    try {
      const res = await fetch(
        `${API_BASE}/postulaciones/consultar-estado/?numero_documento=${encodeURIComponent(cedula)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setConsultaError(
          (body as Record<string, string> | null)?.detail ??
            'No se pudo consultar el estado. Intente nuevamente.'
        );
        setMostrarModal(true);
        return;
      }
      const data = (await res.json()) as PostulacionEstado[];
      setConsultaResultados(data);
      setMostrarModal(true);
    } catch {
      setConsultaError('Error de conexión. Intente nuevamente.');
      setMostrarModal(true);
    } finally {
      setConsultaLoading(false);
    }
  };

  // Cerrar modal al hacer click fuera
  const handleModalBackdrop = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setMostrarModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Encabezado institucional ──────────────────────────────────── */}
      <header className="bg-alcaldia-dark text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-alcaldia.png" alt="Escudo Alcaldía de Popayán" className="h-12 w-auto flex-shrink-0" />
            <div>
              <p className="text-xs text-alcaldia-yellow font-medium tracking-wide uppercase">
                Alcaldía de Popayán
              </p>
              <h1 className="text-base font-bold leading-tight">
                Módulo de Subsidios de Vivienda
              </h1>
            </div>
          </div>
          <Link
            to="/login"
            className="text-sm text-alcaldia-yellow-light hover:text-alcaldia-yellow transition-colors font-medium"
          >
            Acceso funcionarios →
          </Link>
        </div>
      </header>

      {/* ── Contenido principal ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        {isLoading ? (
          <LoadingState />
        ) : programas.length === 0 ? (
          <NoPrograma />
        ) : (
          <div className="w-full max-w-2xl">
            {/* Carrusel */}
            <div className="relative">
              {/* Flechas de navegación cuando hay más de 1 */}
              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Programa anterior"
                    className="absolute -left-4 sm:-left-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-alcaldia-yellow-light/30 hover:text-alcaldia-blue transition-colors"
                  >
                    <IconChevronLeft />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Siguiente programa"
                    className="absolute -right-4 sm:-right-14 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-alcaldia-yellow-light/30 hover:text-alcaldia-blue transition-colors"
                  >
                    <IconChevronRight />
                  </button>
                </>
              )}

              {/* Slide actual */}
              {programas.map((programa, idx) => {
                if (idx !== current) return null;
                const etapa1 = etapasPorPrograma.get(programa.id) ?? null;
                const isPublicada =
                  etapa1?.registro_hogar_publicado === true ||
                  etapa1?.formulario_estado === 'PUBLICADO';
                return (
                  <ProgramaCard
                    key={programa.id}
                    programa={programa}
                    etapa1={etapa1}
                    isPublicada={isPublicada}
                    indice={idx + 1}
                    total={total}
                  />
                );
              })}
            </div>

            {/* Indicadores de puntos */}
            {total > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {programas.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrent(idx)}
                    aria-label={`Ir al programa ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === current
                        ? 'bg-alcaldia-blue scale-110'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Nota informativa */}
            <p className="text-center text-xs text-gray-400 mt-5">
              Para dudas o información adicional, comunícate con la Secretaría de Vivienda
              de la Alcaldía de Popayán.
            </p>
          </div>
        )}
      </main>

      {/* ── Sección de consulta pública ───────────────────────────────── */}
      <section className="bg-white border-t border-gray-200 py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto w-12 h-12 bg-alcaldia-yellow-light/30 rounded-full flex items-center justify-center mb-4">
            <IconSearch />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Consultar estado de postulación
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Ingrese su número de cédula para verificar el estado de su postulación.
            Solo pueden consultar las personas registradas como cabeza de hogar.
          </p>
          <form onSubmit={handleConsultar} className="flex gap-3 max-w-md mx-auto">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Número de cédula"
              value={cedulaConsulta}
              onChange={(e) => setCedulaConsulta(e.target.value.replace(/\D/g, ''))}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alcaldia-blue focus:border-alcaldia-blue"
              required
            />
            <button
              type="submit"
              disabled={consultaLoading || !cedulaConsulta.trim()}
              className="bg-alcaldia-blue hover:bg-alcaldia-dark disabled:bg-alcaldia-blue/50 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              {consultaLoading ? 'Consultando...' : 'Consultar'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Modal de resultado de consulta ─────────────────────────────── */}
      {mostrarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleModalBackdrop}
        >
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between bg-alcaldia-dark text-white px-6 py-4">
              <h3 className="text-base font-bold">Estado de postulación</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-alcaldia-yellow-light hover:text-alcaldia-yellow transition-colors text-xl leading-none"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              {consultaError ? (
                <div className="text-center py-4">
                  <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm">{consultaError}</p>
                </div>
              ) : consultaResultados && consultaResultados.length > 0 ? (
                <div className="space-y-4">
                  {consultaResultados.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500 font-medium">
                          Radicado: {r.numero_radicado}
                        </span>
                        <EstadoBadge estado={r.estado} label={r.estado_label} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{r.nombre_postulante}</p>
                      <p className="text-sm text-gray-600">{r.programa}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Fecha de postulación:{' '}
                        {new Date(r.fecha_postulacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setMostrarModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pie de página ─────────────────────────────────────────────── */}
      <footer className="bg-alcaldia-dark text-alcaldia-yellow-light py-4 text-center text-sm">
        © {new Date().getFullYear()} Alcaldía de Popayán — Secretaría de Vivienda
      </footer>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────── //

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 text-gray-500">
      <div className="w-12 h-12 rounded-full border-4 border-alcaldia-yellow-light border-t-alcaldia-blue animate-spin" />
      <p className="text-base">Cargando programas disponibles...</p>
    </div>
  );
}

function NoPrograma() {
  return (
    <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <IconClock />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Sin convocatorias activas
      </h2>
      <p className="text-gray-500 text-sm">
        En este momento no hay programas de subsidios de vivienda abiertos.
        Vuelve a consultar más adelante o comunícate con la Secretaría de Vivienda.
      </p>
    </div>
  );
}

interface ProgramaCardProps {
  programa: ProgramaPublico;
  etapa1: EtapaPublica | null;
  isPublicada: boolean;
  indice: number;
  total: number;
}

function ProgramaCard({ programa, etapa1, isPublicada, indice, total }: ProgramaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Banner superior */}
      <div className="bg-gradient-to-r from-alcaldia-dark to-alcaldia-blue px-8 py-7 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-alcaldia-yellow">
            Programa activo
          </span>
          {total > 1 && (
            <span className="text-xs text-alcaldia-yellow-light font-medium">
              {indice} / {total}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold leading-snug">{programa.nombre}</h2>
        {programa.entidad_responsable && (
          <p className="text-sm text-alcaldia-yellow-light mt-1">{programa.entidad_responsable}</p>
        )}
        {programa.codigo_programa && (
          <span className="mt-3 inline-block text-xs bg-alcaldia-dark bg-opacity-50 px-2.5 py-1 rounded-full">
            Código: {programa.codigo_programa}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="px-8 py-7">
        {programa.descripcion && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {programa.descripcion}
          </p>
        )}

        {/* Estado del formulario */}
        {isPublicada && etapa1 ? (
          <FormularioDisponible etapaId={etapa1.id} />
        ) : (
          <FormularioNoDisponible />
        )}
      </div>
    </div>
  );
}

function FormularioDisponible({ etapaId }: { etapaId: number }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
        <IconCheck />
        <span className="text-sm font-medium">
          El formulario de postulación está disponible
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        Puedes iniciar tu proceso de postulación al subsidio de vivienda completando
        el formulario de registro del hogar. Asegúrate de tener a mano la
        documentación de todos los miembros de tu hogar.
      </p>
      <Link
        to={`/registro-hogar/${etapaId}`}
        className="flex items-center justify-center gap-2 w-full bg-alcaldia-blue hover:bg-alcaldia-dark active:bg-alcaldia-dark text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-sm"
      >
        Postularme al subsidio
        <IconArrow />
      </Link>
    </div>
  );
}

function FormularioNoDisponible() {
  return (
    <div>
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <IconClock />
        <span className="text-sm font-medium">
          El formulario de postulación aún no está disponible
        </span>
      </div>
      <p className="text-gray-600 text-sm">
        El programa está activo, pero el formulario de registro del hogar todavía
        no ha sido habilitado. Vuelve a consultar esta página próximamente.
      </p>
    </div>
  );
}

const ESTADO_COLORS: Record<string, string> = {
  REGISTRADA:          'bg-blue-100 text-blue-800',
  EN_REVISION:         'bg-yellow-100 text-yellow-800',
  SUBSANACION:         'bg-orange-100 text-orange-800',
  VISITA_PENDIENTE:    'bg-purple-100 text-purple-800',
  VISITA_REALIZADA:        'bg-indigo-100 text-indigo-800',
  DOCUMENTOS_INCOMPLETOS:  'bg-teal-100 text-teal-800',
  DOCUMENTOS_CARGADOS:     'bg-cyan-100 text-cyan-800',
  BENEFICIADO:             'bg-emerald-100 text-emerald-800',
  NO_BENEFICIARIO:         'bg-rose-100 text-rose-800',
  APROBADA:                'bg-green-100 text-green-800',
  RECHAZADA:           'bg-red-100 text-red-800',
};

function EstadoBadge({ estado, label }: { estado: string; label: string }) {
  const color = ESTADO_COLORS[estado] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}
