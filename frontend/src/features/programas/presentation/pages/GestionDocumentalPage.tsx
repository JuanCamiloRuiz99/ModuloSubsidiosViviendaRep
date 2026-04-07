/**
 * GestionDocumentalPage – Selección de programa y listado de postulaciones (Etapa 3).
 *
 * Flujo:
 *  1. Seleccionar un programa.
 *  2. Ver la lista de postulaciones con estado "Visita Realizada".
 *  3. Hacer clic en "Gestionar Documentos" → navega a la pantalla de carga documental.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useProgramas } from '../hooks/useProgramas';
import { usePostulantes, type PostulanteRow } from '../../../postulantes/presentation/hooks/use-postulantes';

// ── Helpers ───────────────────────────────────────────────────────────────── //

function nombreCompleto(row: PostulanteRow) {
  const c = row.ciudadano;
  if (!c) return `Registro #${row.id}`;
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean)
    .join(' ');
}

/** Spinner reutilizable */
const Spinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5 text-purple-500' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const GestionDocumentalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlProgramaId } = useParams<{ id: string; etapaId: string }>();

  // ── Paso 1: Selección de programa ──────────────────────────────────── //

  const { programas, isLoading: loadingProgramas } = useProgramas({ estado: 'ACTIVO' });
  const [selectedProgramaId, setSelectedProgramaId] = useState<string>(urlProgramaId ?? '');

  const selectedPrograma = programas.find(p => String(p.id) === selectedProgramaId);

  const handleProgramaChange = (val: string) => {
    setSelectedProgramaId(val);
    setBusqueda('');
  };

  // ── Paso 2: Postulaciones con estado VISITA_REALIZADA ──────────────── //

  const { postulantes, isLoading: loadingPostulantes } = usePostulantes(
    'VISITA_REALIZADA',
    selectedProgramaId || undefined,
  );
  const postulacionesValidas = useMemo(
    () => postulantes.filter(p => p.id_postulacion != null),
    [postulantes],
  );

  // Búsqueda en la tabla
  const [busqueda, setBusqueda] = useState('');
  const postulacionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return postulacionesValidas;
    const q = busqueda.toLowerCase();
    return postulacionesValidas.filter(p =>
      nombreCompleto(p).toLowerCase().includes(q) ||
      (p.ciudadano?.numero_documento ?? '').toLowerCase().includes(q) ||
      p.numero_radicado.toLowerCase().includes(q),
    );
  }, [postulacionesValidas, busqueda]);

  // Navegación a la pantalla de documentos
  const handleGestionarDocumentos = (postulacionId: number) => {
    // Construir ruta relativa: …/documentos/:postulacionId
    navigate(`${location.pathname}/${postulacionId}`);
  };

  // ── Render ──────────────────────────────────────────────────────────── //

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 py-4">

      {/* ═══ Cabecera ═══ */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Proceso interno</p>
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Gestión Documental Interna</h1>
        </div>
      </div>

      {/* ═══ Paso 1 — Selección del programa ═══ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</span>
            Seleccione el programa
          </span>
        </label>
        {loadingProgramas ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Spinner className="h-4 w-4 text-purple-400" /> Cargando programas...
          </div>
        ) : (
          <select
            value={selectedProgramaId}
            onChange={e => handleProgramaChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
          >
            <option value="">-- Seleccione un programa --</option>
            {programas.map(p => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre}
              </option>
            ))}
          </select>
        )}
        {selectedPrograma && (
          <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm text-purple-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>{selectedPrograma.nombre}</strong> — {selectedPrograma.descripcion || selectedPrograma.entidadResponsable}</span>
          </div>
        )}
      </div>

      {/* ═══ Paso 2 — Lista de postulaciones (Visita Realizada) ═══ */}
      {selectedProgramaId && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-sm font-semibold text-gray-700">Postulaciones con visita realizada</h2>
          </div>

          {/* Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-xs text-teal-700">
            Solo se muestran las postulaciones con estado <strong>Visita Realizada</strong>. Haga clic en <strong>Gestionar Documentos</strong> para cargar los documentos de cada postulación.
          </div>

          {/* Barra de búsqueda */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, documento o radicado..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {postulacionesFiltradas.length} de {postulacionesValidas.length} postulaciones
            </span>
          </div>

          {/* Lista */}
          {loadingPostulantes ? (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
              <Spinner className="h-5 w-5 text-purple-400" /> Cargando postulaciones...
            </div>
          ) : postulacionesFiltradas.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              {busqueda
                ? 'No se encontraron postulaciones con esa búsqueda.'
                : 'No hay postulaciones con visita realizada en este programa.'}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {postulacionesFiltradas.map(row => (
                <div
                  key={row.id_postulacion}
                  className="w-full rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Info principal */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold">
                        {(row.ciudadano?.primer_nombre?.[0] ?? '#').toUpperCase()}
                        {(row.ciudadano?.primer_apellido?.[0] ?? '').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {nombreCompleto(row)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                          <span>{row.ciudadano?.tipo_documento_label} {row.ciudadano?.numero_documento}</span>
                          <span className="text-gray-300">|</span>
                          <span>Rad. {row.numero_radicado}</span>
                          {row.direccion && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="truncate">{row.direccion}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estado + Botón */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                        {row.estado_label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGestionarDocumentos(row.id_postulacion!)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Gestionar Documentos
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
