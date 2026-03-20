/**
 * VisitaTecnicaConfigPage – Configuración de la etapa 2 (Visita Técnica).
 *
 * Vista del gestor/admin – similar a RegistroHogarConfigPage:
 *  1. Muestra las secciones del formulario que el técnico completará.
 *  2. Lista las visitas registradas para esta etapa.
 *  3. Publicar / Inhabilitar el acceso del técnico al formulario.
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { etapasQueryKey } from '../hooks/useEtapas';
import { useVisitasEtapa2 } from '../hooks/useVisitaEtapa2';

// ── Secciones del formulario ─────────────────────────────────────────────── //

interface CampoInfo {
  nombre: string;
  tipo: string;
  obligatorio: boolean;
}

interface SeccionInfo {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  campos: CampoInfo[];
}

const SECCIONES_VISITA: SeccionInfo[] = [
  {
    id: 'info_visita',
    titulo: 'Información de la Visita',
    icono: '📋',
    descripcion: 'Datos generales de la visita técnica realizada.',
    campos: [
      { nombre: 'Fecha de la visita', tipo: 'Fecha/Hora', obligatorio: true },
      { nombre: '¿Visita efectiva?', tipo: 'Sí / No', obligatorio: true },
      { nombre: 'Motivo no efectiva', tipo: 'Selección (Ausente, Rechazo, Dirección no encontrada, Otro)', obligatorio: false },
      { nombre: 'Motivo otro (detalle)', tipo: 'Texto', obligatorio: false },
    ],
  },
  {
    id: 'encuestado',
    titulo: 'Datos del Encuestado',
    icono: '👤',
    descripcion: 'Información de la persona encuestada durante la visita.',
    campos: [
      { nombre: 'Miembro del hogar', tipo: 'Selección (miembros registrados)', obligatorio: false },
      { nombre: 'Nombre del encuestado', tipo: 'Texto', obligatorio: false },
      { nombre: 'Número de documento', tipo: 'Texto', obligatorio: false },
      { nombre: 'Teléfono de contacto', tipo: 'Texto', obligatorio: false },
    ],
  },
  {
    id: 'acta_obs',
    titulo: 'Acta y Observaciones',
    icono: '📝',
    descripcion: 'Registro documental y notas de la visita.',
    campos: [
      { nombre: 'Acta firmada (archivo)', tipo: 'Archivo', obligatorio: false },
      { nombre: 'Observaciones generales', tipo: 'Texto largo', obligatorio: false },
    ],
  },
  {
    id: 'trazabilidad',
    titulo: 'Trazabilidad',
    icono: '🔒',
    descripcion: 'Campos automáticos de auditoría (no editables por el técnico).',
    campos: [
      { nombre: 'Encuestador (creación)', tipo: 'Usuario', obligatorio: true },
      { nombre: 'Fecha de registro', tipo: 'Automático', obligatorio: true },
      { nombre: 'Usuario de modificación', tipo: 'Automático', obligatorio: false },
      { nombre: 'Usuario de validación', tipo: 'Automático', obligatorio: false },
    ],
  },
];

// ── Componente de sección colapsable ──────────────────────────────────────── //

const SeccionPreview: React.FC<{ seccion: SeccionInfo }> = ({ seccion }) => {
  const [abierta, setAbierta] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setAbierta(!abierta)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{seccion.icono}</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{seccion.titulo}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{seccion.descripcion}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400">
            {seccion.campos.length} campos
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${abierta ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {abierta && (
        <div className="border-t border-gray-100 px-5 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left py-2 font-medium">Campo</th>
                <th className="text-left py-2 font-medium">Tipo</th>
                <th className="text-center py-2 font-medium">Obligatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {seccion.campos.map(campo => (
                <tr key={campo.nombre}>
                  <td className="py-2 text-gray-700 font-medium">{campo.nombre}</td>
                  <td className="py-2 text-gray-500">{campo.tipo}</td>
                  <td className="py-2 text-center">
                    {campo.obligatorio ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        Obligatorio
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Opcional
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────── //

export const VisitaTecnicaConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();
  const queryClient = useQueryClient();
  const [accionExito, setAccionExito] = useState<string | null>(null);

  // Datos de la etapa
  const { data: etapas, isLoading: isLoadingEtapas } = useQuery({
    queryKey: etapasQueryKey(programaId!),
    queryFn: () => etapaRepository.listarPorPrograma(programaId!),
    enabled: !!programaId,
  });

  const etapa = etapas?.find(e => String(e.id) === etapaId);
  const isPublicado = etapa?.formulario_estado === 'PUBLICADO';

  // Lista de visitas de esta etapa
  const { data: visitas = [] } = useVisitasEtapa2(
    etapaId ? { etapa: Number(etapaId) } : undefined,
  );

  // Publicar / inhabilitar
  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) });
  };

  const publicarMutation = useMutation({
    mutationFn: () => etapaRepository.publicarVisitaTecnica(Number(etapaId)),
    onSuccess: () => {
      invalidar();
      setAccionExito('Formulario publicado. Los técnicos visitantes ya pueden acceder al formulario de visita.');
    },
  });

  const inhabilitarMutation = useMutation({
    mutationFn: () => etapaRepository.inhabilitarVisitaTecnica(Number(etapaId)),
    onSuccess: () => {
      invalidar();
      setAccionExito('Formulario inhabilitado. El acceso de técnicos fue suspendido.');
    },
  });

  const isPending = publicarMutation.isPending || inhabilitarMutation.isPending;
  const actionError =
    (publicarMutation.isError ? (publicarMutation.error instanceof Error ? publicarMutation.error.message : 'Error al publicar') : null) ??
    (inhabilitarMutation.isError ? (inhabilitarMutation.error instanceof Error ? inhabilitarMutation.error.message : 'Error al inhabilitar') : null);

  if (isLoadingEtapas || !etapa) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <svg className="animate-spin h-7 w-7 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 py-4">

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              Etapa {etapa.numero_etapa} — Visita Técnica
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              Configuración del formulario
            </h1>
          </div>
        </div>
        <span className={`flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isPublicado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPublicado ? 'Publicada' : 'Sin publicar'}
        </span>
      </div>

      {/* Banner éxito */}
      {accionExito && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <p className="text-sm text-green-700">{accionExito}</p>
          <button onClick={() => setAccionExito(null)} className="text-green-400 hover:text-green-700 font-bold text-lg leading-none flex-shrink-0">&times;</button>
        </div>
      )}

      {/* Banner error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        Este formulario tiene <strong>4 secciones predefinidas</strong> que el técnico visitante
        completará durante la visita. Una vez publicada la etapa, los técnicos con visitas
        asignadas podrán acceder al formulario desde <strong>Mis Visitas</strong>.
      </div>

      {/* Secciones del formulario */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-800">Secciones del formulario</h2>
        {SECCIONES_VISITA.map(seccion => (
          <SeccionPreview key={seccion.id} seccion={seccion} />
        ))}
      </section>

      {/* Resumen de visitas */}
      <section>
        <h2 className="text-sm font-bold text-gray-800 mb-3">Visitas registradas</h2>
        {visitas.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-gray-500 font-medium text-sm">No hay visitas registradas aún</p>
            <p className="text-gray-400 text-xs mt-1">
              Las visitas se crean desde el módulo de gestión de visitas cuando se asignan a técnicos.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">ID</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Encuestador</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Fecha</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">Efectiva</th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs">Datos Hogar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visitas.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-900 font-mono text-xs">#{v.id}</td>
                      <td className="px-4 py-2.5 text-gray-700">{v.encuestador_nombre}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {new Date(v.fecha_visita).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.visita_efectiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.visita_efectiva ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {v.tiene_datos_hogar ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Completado</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {visitas.length} visita{visitas.length !== 1 ? 's' : ''} registrada{visitas.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </section>

      {/* Barra de acciones */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Volver
        </button>
        {isPublicado ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => { setAccionExito(null); inhabilitarMutation.mutate(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {inhabilitarMutation.isPending ? 'Inhabilitando...' : 'Inhabilitar acceso'}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => { setAccionExito(null); publicarMutation.mutate(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {publicarMutation.isPending ? 'Publicando...' : 'Publicar etapa'}
          </button>
        )}
      </div>
    </div>
  );
};
