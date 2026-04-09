/**
 * ConstructorFormularioPage - Constructor visual de formulario para una etapa
 *
 * Carga los campos guardados previamente (si existen) y permite al gestor
 * seleccionar, ordenar y configurar campos antes de publicar el formulario.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { CAMPOS_CATALOGO } from '../../domain/formulario';
import type { CampoConfig, CampoPreview } from '../../domain/formulario';
import { useGuardarFormulario } from '../hooks/useGuardarFormulario';
import { useFormularioEtapa, formularioQueryKey } from '../hooks/useFormularioEtapa';
import { etapasQueryKey } from '../hooks/useEtapas';
import { etapaRepository } from '../../infrastructure/persistence/axios-etapa-repository';
import { PreviewModal } from '../components/constructor/PreviewModal';
import { CatalogoPanel } from '../components/constructor/CatalogoPanel';
import { ConstructorPanel } from '../components/constructor/ConstructorPanel';
import { ConfigPanel } from '../components/constructor/ConfigPanel';

export const ConstructorFormularioPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: programaId, etapaId } = useParams<{ id: string; etapaId: string }>();
  const queryClient = useQueryClient();
  const { guardar, isSaving, saveError, isSuccess, reset: resetGuardar } = useGuardarFormulario();
  const [accionExito, setAccionExito] = useState<string | null>(null);

  const inhabilitarMutation = useMutation({
    mutationFn: () => etapaRepository.inhabilitarFormulario(Number(etapaId)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formularioQueryKey(etapaId!) }),
        queryClient.invalidateQueries({ queryKey: etapasQueryKey(programaId!) }),
      ]);
      setAccionExito('Formulario inhabilitado. El acceso público ya no está disponible para ciudadanos.');
    },
  });
  const inhabilitarError = inhabilitarMutation.isError
    ? (inhabilitarMutation.error instanceof Error
        ? inhabilitarMutation.error.message
        : 'Error al inhabilitar el formulario')
    : null;

  // Fetch existing form configuration
  const { data: formularioGuardado, isLoading: isLoadingFormulario } = useFormularioEtapa(etapaId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, CampoConfig>>(() =>
    Object.fromEntries(
      CAMPOS_CATALOGO.map(f => [f.id, { obligatorio: f.obligatorioDefault, texto_ayuda: '' }])
    )
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate state with saved data once loaded
  useEffect(() => {
    if (hydrated || isLoadingFormulario || !formularioGuardado) return;
    const { campos } = formularioGuardado;
    if (campos.length === 0) { setHydrated(true); return; }

    // Restore order and selection
    const sortedIds = [...campos]
      .sort((a, b) => a.orden - b.orden)
      .map(c => c.campo_catalogo)
      .filter(id => CAMPOS_CATALOGO.some(f => f.id === id));

    setSelectedIds(sortedIds);
    setConfigs(prev => {
      const next = { ...prev };
      campos.forEach(c => {
        if (next[c.campo_catalogo] !== undefined) {
          next[c.campo_catalogo] = {
            obligatorio: c.obligatorio,
            texto_ayuda: c.texto_ayuda,
          };
        }
      });
      return next;
    });
    setActiveFieldId(sortedIds[0] ?? null);
    setHydrated(true);
  }, [formularioGuardado, isLoadingFormulario, hydrated]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleToggleField = (fieldId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(fieldId)) {
        const next = prev.filter(id => id !== fieldId);
        if (activeFieldId === fieldId) setActiveFieldId(next[0] ?? null);
        return next;
      }
      return [...prev, fieldId];
    });
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copy = [...selectedIds];
    const [removed] = copy.splice(dragItem.current, 1);
    copy.splice(dragOverItem.current, 0, removed);
    dragItem.current = null;
    dragOverItem.current = null;
    setSelectedIds(copy);
  };

  const updateConfig = (fieldId: string, patch: Partial<CampoConfig>) => {
    setConfigs(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], ...patch } }));
  };

  const isListoParaPublicar = selectedIds.length > 0;
  const estaEditando = (formularioGuardado?.campos.length ?? 0) > 0;
  const activeField = activeFieldId
    ? (CAMPOS_CATALOGO.find(f => f.id === activeFieldId) ?? null)
    : null;
  const activeConfig = activeFieldId ? configs[activeFieldId] : null;
  const camposPreview: CampoPreview[] = selectedIds.map(id => ({
    ...CAMPOS_CATALOGO.find(f => f.id === id)!,
    ...configs[id],
  }));

  // Loading skeleton while fetching saved data
  if (isLoadingFormulario) {
    return (
      <div className="-m-8 flex flex-col items-center justify-center bg-white h-[calc(100vh-88px)]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm font-medium">Cargando configuracion del formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-8 flex flex-col bg-white overflow-hidden h-[calc(100vh-88px)]">
      {showPreview && (
        <PreviewModal camposPreview={camposPreview} onClose={() => setShowPreview(false)} />
      )}

      {/* Barra superior */}
      <div className="flex-shrink-0 bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-blue-800 rounded-full p-1.5 transition-colors"
            title="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight">Constructor de Formulario</h1>
            <p className="text-blue-200 text-xs mt-0.5">
              {estaEditando ? 'Editando formulario guardado' : 'Nuevo formulario'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {estaEditando && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-400 text-blue-900 uppercase tracking-wide">
              Editando
            </span>
          )}
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
            formularioGuardado?.estado === 'PUBLICADO'
              ? 'bg-green-400 text-green-900'
              : 'bg-amber-400 text-amber-900'
          }`}>
            {formularioGuardado?.estado === 'PUBLICADO' ? 'Publicado' : 'Borrador'}
          </span>
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-blue-800 rounded-full p-1.5 transition-colors"
            title="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {(isSuccess || accionExito) && (
        <div className="flex-shrink-0 bg-green-50 border-b border-green-200 px-6 py-3 flex items-center justify-between text-sm text-green-700">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {accionExito ?? 'Formulario guardado correctamente.'}
          </div>
          <button
            onClick={() => { setAccionExito(null); resetGuardar(); }}
            className="ml-4 text-green-500 hover:text-green-700 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {(saveError || inhabilitarError) && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-sm text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {saveError ?? inhabilitarError}
        </div>
      )}

      {/* Banner informativo cuando se edita un formulario existente */}
      {estaEditando && (
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center gap-2 text-sm text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Se cargaron <strong className="mx-1">{formularioGuardado?.campos.length} campos</strong> guardados previamente. Puede modificarlos y actualizar el formulario.
        </div>
      )}

      {/* Cuerpo 3 columnas */}
      <div className="flex flex-1 overflow-hidden">
        <CatalogoPanel selectedIds={selectedIds} onToggle={handleToggleField} />
        <ConstructorPanel
          selectedIds={selectedIds}
          configs={configs}
          activeFieldId={activeFieldId}
          onSelectField={setActiveFieldId}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
        />
        <ConfigPanel
          activeField={activeField}
          activeConfig={activeConfig}
          onUpdate={updateConfig}
        />
      </div>

      {/* Barra inferior */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <p className={`text-sm font-medium flex items-center gap-2 transition-colors ${isListoParaPublicar ? 'text-green-600' : 'text-gray-400'}`}>
          {isListoParaPublicar ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {estaEditando ? `${selectedIds.length} campo${selectedIds.length !== 1 ? 's' : ''} configurado${selectedIds.length !== 1 ? 's' : ''}` : 'El formulario está listo para guardar'}
            </>
          ) : (
            'Agregue al menos un campo para guardar el formulario'
          )}
        </p>
        <div className="flex items-center gap-3">
          <button
            disabled={!isListoParaPublicar}
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-blue-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Previsualizar
          </button>
          {formularioGuardado?.estado === 'PUBLICADO' ? (
            <button
              disabled={inhabilitarMutation.isPending}
              onClick={() => { setAccionExito(null); inhabilitarMutation.mutate(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              {inhabilitarMutation.isPending ? 'Inhabilitando...' : 'Inhabilitar Formulario'}
            </button>
          ) : (
            <button
              disabled={!isListoParaPublicar || isSaving}
              onClick={() => guardar({ programaId: programaId!, etapaId: etapaId!, selectedIds, configs })}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isSaving ? 'Guardando...' : estaEditando ? 'Actualizar Formulario' : 'Guardar Formulario'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};