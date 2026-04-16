/**
 * RegistroHogarPage — Formulario público multi-paso para el registro del
 * hogar (módulo REGISTRO_HOGAR).
 *
 * Pasos:
 *   1. Información del Hogar  (gestion_hogar_etapa1)
 *   2. Composición del Hogar  (miembros_hogar)
 *   3. Documentos             (documentos_hogar + documentos_miembro)
 *   4. Revisión y Envío
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEtapaInfoPublica } from '../hooks/useFormularioEtapa';
import { registroHogarRepository } from '../../infrastructure/persistence/axios-registro-hogar-repository';
import {
  INFO_HOGAR_INICIAL,
  MIEMBRO_VACIO,
  TIPOS_DOCUMENTO_HOGAR,
} from '../../domain/registro-hogar.types';
import type {
  InfoHogarForm,
  MiembroHogarForm,
  DocumentoHogarEntry,
  DocumentoMiembroEntry,
  RegistroHogarResult,
} from '../../domain/registro-hogar.types';

import { WizardStepper }     from '../components/registro-hogar/WizardStepper';
import { SeccionInfoHogar }  from '../components/registro-hogar/SeccionInfoHogar';
import { SeccionMiembros }   from '../components/registro-hogar/SeccionMiembros';
import { SeccionDocumentos } from '../components/registro-hogar/SeccionDocumentos';

// ── Tipos internos ─────────────────────────────────────────────────────────── //

type WizardStep = 1 | 2 | 3 | 4;

type ErroresInfoHogar = Partial<Record<keyof InfoHogarForm, string>>;
type ErroresMiembro   = Partial<Record<keyof MiembroHogarForm, string>>;

// ── Constantes ────────────────────────────────────────────────────────────── //

const PASOS = [
  { numero: 1, label: 'Información del Hogar'  },
  { numero: 2, label: 'Composición del Hogar'  },
  { numero: 3, label: 'Documentos'              },
  { numero: 4, label: 'Revisión y Envío'        },
];

// ── Validaciones ──────────────────────────────────────────────────────────── //

function validarPaso1(info: InfoHogarForm): ErroresInfoHogar {
  const e: ErroresInfoHogar = {};
  if (!info.departamento.trim()) e.departamento = 'Campo requerido';
  if (!info.municipio.trim())    e.municipio    = 'Campo requerido';
  if (!info.zona)                e.zona         = 'Seleccione una zona';
  if (!info.tipo_predio)         e.tipo_predio  = 'Seleccione el tipo de predio';
  if (!info.direccion.trim())    e.direccion    = 'Campo requerido';
  if (info.zona === 'URBANA' && !info.estrato.trim()) e.estrato = 'Requerido para zona urbana';
  if (!info.acepta_terminos_condiciones) e.acepta_terminos_condiciones = 'Debe aceptar los términos';
  return e;
}

function validarPaso3(miembros: MiembroHogarForm[]): string | null {
  for (const m of miembros) {
    const nombre = [m.primer_nombre, m.primer_apellido].filter(Boolean).join(' ') || 'un miembro';
    const frenteOk = m.documentos.find(d => d.tipo_documento === 'FOTO_CEDULA_FRENTE')?.file != null;
    const reversoOk = m.documentos.find(d => d.tipo_documento === 'FOTO_CEDULA_REVERSO')?.file != null;
    if (!frenteOk)  return `Falta la foto de la cédula (frente) de ${nombre}.`;
    if (!reversoOk) return `Falta la foto de la cédula (reverso) de ${nombre}.`;
    if (m.pertenece_sisben && !m.documentos.find(d => d.tipo_documento === 'CERTIFICADO_SISBEN')?.file)
      return `Falta el certificado SISBEN de ${nombre}.`;
    if (m.tiene_discapacidad && !m.documentos.find(d => d.tipo_documento === 'CERTIFICADO_DISCAPACIDAD')?.file)
      return `Falta el certificado de discapacidad de ${nombre}.`;
    if ((m.es_victima_conflicto || m.es_desplazado) && !m.documentos.find(d => d.tipo_documento === 'CERTIFICADO_VICTIMA')?.file)
      return `Falta el certificado de víctima (RUV) de ${nombre}.`;
  }
  return null;
}

function validarPaso2(miembros: MiembroHogarForm[]): Record<string, ErroresMiembro> {
  const errs: Record<string, ErroresMiembro> = {};
  miembros.forEach(m => {
    const e: ErroresMiembro = {};
    if (!m.tipo_documento)            e.tipo_documento    = 'Requerido';
    if (!m.numero_documento.trim())   e.numero_documento  = 'Requerido';
    if (!m.primer_nombre.trim())      e.primer_nombre     = 'Requerido';
    if (!m.primer_apellido.trim())    e.primer_apellido   = 'Requerido';
    if (!m.fecha_nacimiento)          e.fecha_nacimiento  = 'Requerido';
    if (!m.parentesco)                e.parentesco        = 'Requerido';
    if (m.parentesco === 'OTRO' && !m.parentesco_otro.trim())
                                      e.parentesco_otro   = 'Especifique el parentesco';
    if (m.correo_electronico && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.correo_electronico))
                                      e.correo_electronico = 'Correo electrónico inválido';
    if (Object.keys(e).length > 0) errs[m._localId] = e;
  });

  // Cédulas duplicadas dentro de la misma postulación
  const cuenta: Record<string, string[]> = {};
  miembros.forEach(m => {
    const num = m.numero_documento.trim();
    if (!num) return;
    if (!cuenta[num]) cuenta[num] = [];
    cuenta[num].push(m._localId);
  });
  Object.entries(cuenta).forEach(([num, ids]) => {
    if (ids.length > 1) {
      ids.forEach(id => {
        if (!errs[id]) errs[id] = {};
        errs[id].numero_documento = `Número de cédula ${num} duplicado en esta postulación`;
      });
    }
  });

  return errs;
}

// ── Pantalla de formulario cerrado ────────────────────────────────────────── //

const PantallaCerrada: React.FC<{ programaNombre?: string }> = ({ programaNombre }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Formulario no disponible</h1>
        {programaNombre && (
          <p className="text-amber-100 text-sm">{programaNombre}</p>
        )}
      </div>
      <div className="p-8">
        <p className="text-gray-600 text-sm">
          El período de registro para esta etapa se encuentra <span className="font-semibold text-amber-700">inhabilitado</span>.
          Comuníquese con la alcaldía para más información.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  </div>
);

// ── Componente de confirmación ────────────────────────────────────────────── //

const PantallaExito: React.FC<{ result: RegistroHogarResult }> = ({ result }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-8 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">¡Registro exitoso!</h1>
        <p className="text-green-100 text-sm">Su solicitud fue radicada correctamente.</p>
      </div>
      <div className="p-8 flex flex-col gap-4">
        <InfoRow label="Número de radicado"  value={result.numero_radicado}            highlight />
        <InfoRow label="Código de postulación" value={String(result.id_postulacion)}  />
        <InfoRow label="Fecha de radicación" value={
          new Date(result.fecha_radicado).toLocaleString('es-CO', {
            dateStyle: 'long',
            timeStyle: 'short',
          })
        } />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
          <p className="text-sm text-amber-800 font-medium">📋 Guarde este número de radicado</p>
          <p className="text-xs text-amber-600 mt-1">
            Lo necesitará para hacer seguimiento a su solicitud ante la alcaldía.
          </p>
        </div>
        {result.advertencias && result.advertencias.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
            <p className="text-sm text-red-800 font-medium">⚠ Algunos documentos no se pudieron cargar:</p>
            <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
              {result.advertencias.map((adv, i) => <li key={i}>{adv}</li>)}
            </ul>
            <p className="text-xs text-red-500 mt-2">
              Puede volver a cargarlos desde el módulo de postulaciones.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
    <span className={`font-bold ${highlight ? 'text-2xl text-green-600' : 'text-gray-800'}`}>{value}</span>
  </div>
);

// ── Resumen (paso 4) ──────────────────────────────────────────────────────── //

const ResumenCard: React.FC<{
  infoHogar: InfoHogarForm;
  miembros: MiembroHogarForm[];
  documentosHogar: DocumentoHogarEntry[];
}> = ({ infoHogar, miembros, documentosHogar }) => {
  const docsConArchivo = documentosHogar.filter(d => d.file !== null).length;
  const docsRequeridos = TIPOS_DOCUMENTO_HOGAR.length;
  const docsRequeridosCargados = TIPOS_DOCUMENTO_HOGAR
    .filter(t => documentosHogar.find(d => d.tipo_documento === t.value)?.file !== null)
    .length;
  const docsOkMiembros = miembros.reduce((acc, m) => acc + m.documentos.filter(d => d.file !== null).length, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-1">
        <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">Información del hogar</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">{infoHogar.municipio || '—'}</span>
          {infoHogar.departamento && <span className="text-gray-500">, {infoHogar.departamento}</span>}
        </p>
        <p className="text-sm text-gray-600">{infoHogar.direccion || '—'}</p>
        {infoHogar.zona && (
          <span className="inline-flex w-fit mt-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {infoHogar.zona === 'URBANA' ? 'Zona Urbana' : 'Zona Rural'}
          </span>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-purple-500 font-bold uppercase tracking-wide">Composición del hogar</p>
          <p className="text-sm text-gray-700 mt-1">
            {miembros.length === 0
              ? 'Sin miembros registrados'
              : `${miembros.length} miembro${miembros.length !== 1 ? 's' : ''} registrado${miembros.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <span className="text-2xl font-bold text-purple-600">{miembros.length}</span>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-xs text-teal-500 font-bold uppercase tracking-wide mb-2">Documentos</p>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{docsConArchivo}</span> de {documentosHogar.length} documentos del hogar cargados
            {docsRequeridosCargados < docsRequeridos && (
              <span className="ml-2 text-xs text-amber-600 font-medium">
                ({docsRequeridos - docsRequeridosCargados} obligatorio{docsRequeridos - docsRequeridosCargados !== 1 ? 's' : ''} pendiente{docsRequeridos - docsRequeridosCargados !== 1 ? 's' : ''})
              </span>
            )}
          </p>
          {miembros.length > 0 && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">{docsOkMiembros}</span> documento{docsOkMiembros !== 1 ? 's' : ''} de miembros cargado{docsOkMiembros !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {docsRequeridosCargados < docsRequeridos && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg leading-tight flex-shrink-0">⚠</span>
          <p className="text-sm text-amber-700">
            Faltan {docsRequeridos - docsRequeridosCargados} documento{docsRequeridos - docsRequeridosCargados !== 1 ? 's' : ''} obligatorio{docsRequeridos - docsRequeridosCargados !== 1 ? 's' : ''}.
            Puede enviar igual, pero el proceso quedará incompleto hasta adjuntarlos.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────── //

export const RegistroHogarPage: React.FC = () => {
  const { etapaId } = useParams<{ etapaId: string }>();

  // Información de la etapa (nombre del programa, estado publicado, etc.)
  const { data: etapaInfo, isLoading: loadingEtapa, isSuccess: etapaLoaded } = useEtapaInfoPublica(etapaId);

  // ── Estado del wizard ──────────────────────────────────────────────────── //
  const [paso, setPaso] = useState<WizardStep>(1);
  const [infoHogar, setInfoHogar]             = useState<InfoHogarForm>(INFO_HOGAR_INICIAL);
  const [miembros, setMiembros]               = useState<MiembroHogarForm[]>([MIEMBRO_VACIO()]);
  const [documentosHogar, setDocumentosHogar] = useState<DocumentoHogarEntry[]>(
    TIPOS_DOCUMENTO_HOGAR.map(t => ({ tipo_documento: t.value, file: null, observaciones: '' })),
  );

  // Errores por sección
  const [errores1, setErrores1]                     = useState<ErroresInfoHogar>({});
  const [erroresPorMiembro, setErroresPorMiembro]   = useState<Record<string, ErroresMiembro>>({});
  const [erroresPaso3, setErroresPaso3]             = useState<string | null>(null);
  const [errorCabezaHogar, setErrorCabezaHogar]     = useState<string | null>(null);

  // Estado de envío
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [result, setResult]               = useState<RegistroHogarResult | null>(null);

  // ── Navegación entre pasos ─────────────────────────────────────────────── //

  const avanzar = () => {
    if (paso === 1) {
      const e = validarPaso1(infoHogar);
      setErrores1(e);
      if (Object.keys(e).length > 0) return;
    }

    if (paso === 2) {
      const e = validarPaso2(miembros);
      setErroresPorMiembro(e);
      if (Object.keys(e).length > 0) return;

      if (!miembros.some(m => m.es_cabeza_hogar)) {
        setErrorCabezaHogar('El hogar debe tener al menos un miembro marcado como cabeza de hogar.');
        return;
      }
      setErrorCabezaHogar(null);
    }

    if (paso === 3) {
      const err = validarPaso3(miembros);
      setErroresPaso3(err);
      if (err) return;
    }

    setPaso(prev => Math.min(prev + 1, 4) as WizardStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retroceder = () => {
    setPaso(prev => Math.max(prev - 1, 1) as WizardStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Actualizar documentos de miembro ──────────────────────────────────── //

  const handleDocMiembro = (miembroLocalId: string, docs: DocumentoMiembroEntry[]) => {
    setMiembros(prev =>
      prev.map(m => m._localId === miembroLocalId ? { ...m, documentos: docs } : m),
    );
    setErroresPaso3(null);
  };

  // ── Envío final ────────────────────────────────────────────────────────── //

  const handleSubmit = async () => {
    if (!etapaId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await registroHogarRepository.enviarCompleto(
        Number(etapaId),
        infoHogar,
        miembros,
        documentosHogar,
      );
      setResult(res);
    } catch (err) {
      // Aplanar recursivamente los errores de Django DRF (pueden ser objetos/arrays anidados)
      const flattenErrors = (val: unknown, prefix = ''): string[] => {
        if (typeof val === 'string') return [prefix ? `${prefix}: ${val}` : val];
        if (Array.isArray(val)) {
          return val.flatMap((item, i) => {
            if (typeof item === 'string') return [prefix ? `${prefix}: ${item}` : item];
            if (typeof item === 'object' && item !== null) {
              const label = prefix ? `${prefix}[${i + 1}]` : `miembro ${i + 1}`;
              return flattenErrors(item, label);
            }
            return [];
          });
        }
        if (typeof val === 'object' && val !== null) {
          return Object.entries(val as Record<string, unknown>).flatMap(([k, v]) =>
            flattenErrors(v, prefix ? `${prefix}.${k}` : k),
          );
        }
        return [];
      };

      const axiosResp = (err as { response?: { data?: unknown } })?.response?.data;
      let msg = 'Error desconocido. Intente nuevamente.';
      if (axiosResp && typeof axiosResp === 'object') {
        const d = axiosResp as Record<string, unknown>;
        if (typeof d.detail === 'string') {
          msg = d.detail;
        } else {
          const lines = flattenErrors(d);
          if (lines.length > 0) msg = lines.join('\n');
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pantalla de éxito ──────────────────────────────────────────────────── //

  if (result) return <PantallaExito result={result} />;

  // ── Guard: formulario inhabilitado ────────────────────────────────────── //

  if (loadingEtapa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (etapaLoaded && !etapaInfo?.registro_hogar_publicado) {
    return <PantallaCerrada programaNombre={etapaInfo?.programa_nombre} />;
  }

  // ── Render del wizard ──────────────────────────────────────────────────── //

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900">
      {/* ── Header ── */}
      <header className="pt-10 pb-4 px-4 text-center">
        {etapaInfo && (
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
            {etapaInfo.programa_nombre}
          </p>
        )}
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
          Registro del Hogar
        </h1>
        {etapaInfo && (
          <p className="text-blue-200 text-sm mt-1">
            Etapa {etapaInfo.numero_etapa}
          </p>
        )}
      </header>

      {/* ── Stepper ── */}
      <div className="px-4 pb-8">
        <WizardStepper pasoActual={paso} pasos={PASOS} />
      </div>

      {/* ── Contenido del paso ── */}
      <main className="max-w-3xl mx-auto px-4 pb-32">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Título del paso */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {paso}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {PASOS[paso - 1].label}
                </h2>
                <p className="text-xs text-gray-400">Paso {paso} de {PASOS.length}</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-6">
            {paso === 1 && (
              <SeccionInfoHogar
                data={infoHogar}
                onChange={setInfoHogar}
                errores={errores1}
              />
            )}
            {paso === 2 && (
              <>
                <SeccionMiembros
                  miembros={miembros}
                  onChange={setMiembros}
                  erroresPorMiembro={erroresPorMiembro}
                />
                {errorCabezaHogar && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{errorCabezaHogar}</p>
                  </div>
                )}
              </>
            )}
            {paso === 3 && (
              <>
                <SeccionDocumentos
                  documentosHogar={documentosHogar}
                  onChangeDocHogar={setDocumentosHogar}
                  miembros={miembros}
                  onChangeDocMiembro={handleDocMiembro}
                  esPropietario={infoHogar.es_propietario}
                />
                {erroresPaso3 && (
                  <div className="mx-0 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{erroresPaso3}</p>
                  </div>
                )}
              </>
            )}
            {paso === 4 && (
              <ResumenCard
                infoHogar={infoHogar}
                miembros={miembros}
                documentosHogar={documentosHogar}
              />
            )}
          </div>

          {/* Error de envío */}
          {submitError && (
            <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 whitespace-pre-line">{submitError}</p>
            </div>
          )}

          {/* Navegación */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={retroceder}
              disabled={paso === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {paso < 4 ? (
              <button
                type="button"
                onClick={avanzar}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                Siguiente
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enviar solicitud
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
