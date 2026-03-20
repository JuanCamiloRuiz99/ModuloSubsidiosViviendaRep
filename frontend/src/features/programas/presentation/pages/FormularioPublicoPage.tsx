/**
 * FormularioPublicoPage - Formulario ciudadano de postulacion
 *
 * Ruta publica, sin autenticacion. Carga el formulario publicado de una
 * etapa y permite al ciudadano completarlo y enviar sus datos.
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormularioPublico } from '../hooks/useFormularioEtapa';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { CAMPOS_CATALOGO, SELECT_OPTIONS, SECCIONES } from '../../domain/formulario';

export const FormularioPublicoPage: React.FC = () => {
  const { etapaId } = useParams<{ etapaId: string }>();
  const { data: formulario, isLoading, isError, error } = useFormularioPublico(etapaId);

  const [valores, setValores] = useState<Record<string, string>>({});
  const [radicado, setRadicado] = useState<{ numero: string; fecha: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: string) => {
    setValores(prev => ({ ...prev, [fieldId]: value }));
    if (erroresValidacion[fieldId]) {
      setErroresValidacion(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulario || !etapaId) return;

    // Validate required fields client-side
    const nuevosErrores: Record<string, string> = {};
    formulario.campos.forEach(campo => {
      if (campo.obligatorio && !valores[campo.campo_catalogo]?.trim()) {
        const meta = CAMPOS_CATALOGO.find(f => f.id === campo.campo_catalogo);
        nuevosErrores[campo.campo_catalogo] = `${meta?.label ?? campo.campo_catalogo} es obligatorio`;
      }
    });

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresValidacion(nuevosErrores);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
    const resultado = await etapaRepository.enviarFormulario(Number(etapaId), valores);
      setRadicado({ numero: String(resultado.id_persona), fecha: resultado.fecha_creacion });
    } catch (err: any) {
      // Server-side field validation errors (422)
      const serverErrors = err?.response?.data?.errores;
      if (serverErrors && typeof serverErrors === 'object') {
        setErroresValidacion(serverErrors);
      } else {
        setSubmitError(
          err?.response?.data?.detail ?? 'Ocurrió un error al enviar el formulario. Intente de nuevo.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────── //
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm font-medium">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  // ── Not found / not published ─────────────────────────────────────────── //
  if (isError || !formulario) {
    const msg = (error as any)?.response?.data?.detail ?? 'Este formulario no esta disponible.';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-lg font-bold text-gray-800 mb-2">Formulario no disponible</h1>
          <p className="text-sm text-gray-500">{msg}</p>
        </div>
      </div>
    );
  }

  // ── Sent confirmation ─────────────────────────────────────────────────── //
  if (radicado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Postulación registrada</h1>
          <p className="text-sm text-gray-500 mb-6">
            Sus datos han sido registrados exitosamente en el programa{' '}
            <strong>{formulario?.programa_nombre}</strong>.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-6">
            <p className="text-xs text-blue-500 uppercase tracking-widest font-semibold mb-1">Número de identificación del registro</p>
            <p className="text-2xl font-mono font-bold text-blue-800">#{radicado.numero}</p>
            <p className="text-xs text-blue-400 mt-1">
              {new Date(radicado.fecha).toLocaleString('es-CO', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Guarde este número para hacer seguimiento a su postulación.
          </p>
        </div>
      </div>
    );
  }

  // ── Build campo metadata map ──────────────────────────────────────────── //
  const camposActivos = formulario.campos
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map(c => ({
      ...c,
      meta: CAMPOS_CATALOGO.find(f => f.id === c.campo_catalogo),
    }))
    .filter(c => !!c.meta);

  // ── Render ────────────────────────────────────────────────────────────── //
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 py-10 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 text-center text-white">
        <p className="text-blue-200 text-xs uppercase tracking-widest mb-1 font-semibold">
          Alcaldia Municipal
        </p>
        <h1 className="text-2xl font-bold">{formulario.programa_nombre}</h1>
        <p className="text-blue-200 text-sm mt-1">
          Etapa {formulario.numero_etapa} &mdash; Formulario de Postulacion
        </p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress hint */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2 text-sm text-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete todos los campos obligatorios marcados con&nbsp;<span className="text-red-500 font-bold">*</span>
          </div>

          <div className="px-6 py-6 space-y-8">
            {SECCIONES.map(seccion => {
              const camposSec = camposActivos.filter(c => c.meta!.seccion === seccion);
              if (camposSec.length === 0) return null;
              return (
                <div key={seccion}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                    {seccion}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {camposSec.map(campo => {
                      const { meta, campo_catalogo, obligatorio, texto_ayuda } = campo;
                      const fieldError = erroresValidacion[campo_catalogo];
                      const inputClass = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        fieldError
                          ? 'border-red-300 focus:ring-red-400 bg-red-50'
                          : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
                      }`;

                      return (
                        <div
                          key={campo_catalogo}
                          className={meta!.type === 'email' ? 'sm:col-span-2' : ''}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {meta!.label}
                            {obligatorio && <span className="text-red-500 ml-1">*</span>}
                          </label>

                          {meta!.type === 'select' ? (
                            <select
                              value={valores[campo_catalogo] ?? ''}
                              onChange={e => handleChange(campo_catalogo, e.target.value)}
                              className={inputClass}
                            >
                              <option value="">Seleccione una opcion...</option>
                            {(SELECT_OPTIONS[campo_catalogo] ?? []).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={meta!.type}
                              value={valores[campo_catalogo] ?? ''}
                              onChange={e => handleChange(campo_catalogo, e.target.value)}
                              placeholder={texto_ayuda || `Ingrese ${meta!.label.toLowerCase()}`}
                              className={inputClass}
                            />
                          )}

                          {texto_ayuda && !fieldError && (
                            <p className="text-xs text-gray-400 mt-1">{texto_ayuda}</p>
                          )}
                          {fieldError && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {fieldError}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            {submitError && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {submitError}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Al enviar este formulario acepta que sus datos seran usados exclusivamente para el
                tramite de subsidio de vivienda.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Enviar postulacion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <p className="text-center text-blue-300 text-xs mt-6">
        Formulario generado por el sistema de subsidios de vivienda
      </p>
    </div>
  );
};
