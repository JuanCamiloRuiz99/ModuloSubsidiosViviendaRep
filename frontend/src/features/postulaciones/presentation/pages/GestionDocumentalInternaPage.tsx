/**
 * GestionDocumentalInternaPage – Módulo independiente de Documentos Internos.
 *
 * Flujo:
 *  1. Seleccionar un programa activo.
 *  2. Ver las postulaciones con estado "Visita Realizada".
 *  3. Clic en "Gestionar Documentos" → navega a DocumentosPostulacionInternaPage.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgramas } from '../../../programas/presentation/hooks/useProgramas';
import { useEtapas } from '../../../programas/presentation/hooks/useEtapas';
import { usePostulantes, type PostulanteRow } from '../../../postulantes/presentation/hooks/use-postulantes';

// ── Helpers ───────────────────────────────────────────────────────────────── //

function nombreCompleto(row: PostulanteRow) {
  const c = row.ciudadano;
  if (!c) return `Registro #${row.id}`;
  return [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
    .filter(Boolean)
    .join(' ');
}

const Spinner: React.FC<{ className?: string }> = ({ className = 'h-5 w-5 text-purple-500' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────── //

export const GestionDocumentalInternaPage: React.FC = () => {
  const navigate = useNavigate();

  // ── Paso 1: Selección de programa ──────────────────────────────────── //
  const { programas, isLoading: loadingProgramas } = useProgramas({ estado: 'ACTIVO' });
  const [selectedProgramaId, setSelectedProgramaId] = useState<string>('');

  const selectedPrograma = programas.find(p => String(p.id) === selectedProgramaId);

  // Verificar si el programa tiene etapa de gestión documental activada
  const { data: etapas = [], isLoading: loadingEtapas } = useEtapas(selectedProgramaId);
  const tieneGestionDocumental = etapas.some(
    e => e.modulo_principal === 'GESTION_DOCUMENTAL_INTERNA' && e.gestion_documental_publicado && !e.finalizada,
  );

  const handleProgramaChange = (val: string) => {
    setSelectedProgramaId(val);
    setBusqueda('');
  };

  // ── Paso 2: Postulaciones con estado VISITA_REALIZADA o DOCUMENTOS_INCOMPLETOS ── //
  const { postulantes, isLoading: loadingPostulantes } = usePostulantes(
    'VISITA_REALIZADA,DOCUMENTOS_INCOMPLETOS',
    selectedProgramaId || undefined,
  );
  const postulacionesValidas = useMemo(
    () => postulantes.filter(p => p.id_postulacion != null),
    [postulantes],
  );

  // Búsqueda
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

  const handleGestionarDocumentos = (postulacionId: number) => {
    navigate(`/documentos-internos/${postulacionId}`);
  };

  // ── Render ──────────────────────────────────────────────────────────── //
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 py-4">

      {/* ═══ Cabecera ═══ */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Proceso interno</p>
        <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Gestión Documental Interna</h1>
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
      {selectedProgramaId && !loadingEtapas && !tieneGestionDocumental && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Este programa <strong>no tiene una etapa de Gestión Documental Interna activada</strong>. Debe activar la etapa desde la configuración del programa para poder gestionar documentos.</span>
        </div>
      )}
      {selectedProgramaId && loadingEtapas && (
        <div className="flex items-center gap-2 text-sm text-gray-400 px-2">
          <Spinner className="h-4 w-4 text-purple-400" /> Verificando etapas del programa...
        </div>
      )}
      {selectedProgramaId && tieneGestionDocumental && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-sm font-semibold text-gray-700">Postulaciones pendientes de documentación</h2>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-xs text-teal-700">
            Se muestran las postulaciones con estado <strong>Visita Realizada</strong> o <strong>Documentos Incompletos</strong>. Haga clic en <strong>Gestionar Documentos</strong> para cargar los documentos de cada postulación.
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
                : 'No hay postulaciones pendientes de documentación en este programa.'}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {postulacionesFiltradas.map(row => (
                <div
                  key={row.id_postulacion}
                  className="w-full rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all p-4"
                >
                  <div className="flex items-center justify-between gap-3">
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

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.estado === 'DOCUMENTOS_INCOMPLETOS'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
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
