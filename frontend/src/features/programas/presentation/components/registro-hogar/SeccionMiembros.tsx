/**
 * SeccionMiembros — Paso 2 del formulario de Registro del Hogar.
 *
 * Lista dinámica de miembros del hogar. Cada miembro se muestra como una
 * tarjeta colapsable que contiene el MiembroForm completo.
 */

import React, { useState } from 'react';
import type { MiembroHogarForm } from '../../../domain/registro-hogar.types';
import { PARENTESCO_OPTIONS, MIEMBRO_VACIO } from '../../../domain/registro-hogar.types';
import { MiembroForm } from './MiembroForm';
import type { ErroresMiembro } from './MiembroForm';

interface Props {
  miembros: MiembroHogarForm[];
  onChange: (miembros: MiembroHogarForm[]) => void;
  erroresPorMiembro?: Record<string, ErroresMiembro>;
}

export const SeccionMiembros: React.FC<Props> = ({
  miembros,
  onChange,
  erroresPorMiembro = {},
}) => {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) =>
    setExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const agregarMiembro = () => {
    const nuevo = MIEMBRO_VACIO();
    onChange([...miembros, nuevo]);
    setExpandidos(prev => new Set([...prev, nuevo._localId]));
  };

  const eliminarMiembro = (localId: string) => {
    onChange(miembros.filter(m => m._localId !== localId));
    setExpandidos(prev => {
      const next = new Set(prev);
      next.delete(localId);
      return next;
    });
  };

  const actualizarMiembro = (localId: string, actualizado: MiembroHogarForm) =>
    onChange(miembros.map(m => (m._localId === localId ? actualizado : m)));

  const labelParentesco = (val: string) =>
    PARENTESCO_OPTIONS.find(o => o.value === val)?.label ?? val;

  return (
    <div className="flex flex-col gap-4">
      {/* Descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-0.5">Composición del hogar</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Registre a todas las personas que conviven en el predio. Si hay miembros con
            condiciones especiales (discapacidad, desplazamiento, etc.), complete esa sección
            dentro de cada tarjeta.
          </p>
        </div>
      </div>

      {/* Lista de miembros */}
      {miembros.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
          <p className="text-sm font-medium text-gray-500 mb-1">No hay miembros registrados</p>
          <p className="text-xs text-gray-400">
            Use el botón para agregar cada persona que vive en el hogar.
          </p>
        </div>
      ) : (
        miembros.map((miembro, idx) => {
          const isExpanded = expandidos.has(miembro._localId);
          const errores    = erroresPorMiembro[miembro._localId] ?? {};
          const tieneError = Object.keys(errores).length > 0;
          const nombreCompleto = [miembro.primer_nombre, miembro.primer_apellido]
            .filter(Boolean)
            .join(' ') || 'Nuevo miembro';
          const parentescoLabel = miembro.parentesco ? labelParentesco(miembro.parentesco) : '';

          return (
            <div
              key={miembro._localId}
              className={`border rounded-xl overflow-hidden transition-colors ${
                tieneError
                  ? 'border-red-300'
                  : isExpanded
                  ? 'border-blue-300'
                  : 'border-gray-200'
              }`}
            >
              {/* Cabecera de la tarjeta */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors ${
                  tieneError
                    ? 'bg-red-50 hover:bg-red-100'
                    : isExpanded
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleExpand(miembro._localId)}
              >
                {/* Número */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    tieneError
                      ? 'bg-red-200 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Nombre */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${tieneError ? 'text-red-700' : 'text-gray-800'}`}>
                    {nombreCompleto}
                  </p>
                  {(parentescoLabel || miembro.numero_documento) && (
                    <p className="text-xs text-gray-500 truncate">
                      {[parentescoLabel, miembro.numero_documento].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                {/* Badges de condiciones */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {miembro.es_cabeza_hogar && (
                    <span className="hidden sm:inline-flex text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      Cabeza de hogar
                    </span>
                  )}
                  {miembro.tiene_discapacidad && (
                    <span className="hidden sm:inline-flex text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                      Discapacidad
                    </span>
                  )}
                  {miembro.es_victima_conflicto && (
                    <span className="hidden sm:inline-flex text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                      Víctima
                    </span>
                  )}
                  {tieneError && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                      Incompleto
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); eliminarMiembro(miembro._localId); }}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                  title="Eliminar miembro"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Toggle chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Cuerpo del formulario */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-100 bg-white">
                  <MiembroForm
                    miembro={miembro}
                    onChange={actualizado => actualizarMiembro(miembro._localId, actualizado)}
                    errores={errores}
                  />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={agregarMiembro}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Agregar miembro del hogar
      </button>
    </div>
  );
};
